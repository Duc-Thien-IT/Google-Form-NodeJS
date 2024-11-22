import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendOtpEmail } from '../mailer';
import RefreshToken from '../models/Token';

// Biến otpStore lưu trữ OTP trong bộ nhớ tạm (memory store)
let otpStore: Record<string, { otp: string, expires: number }> = {};

// Hàm tạo OTP ngẫu nhiên
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const authController = {

  // Register
  registerUser: async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
  
      // Kiểm tra nếu username đã tồn tại
      const existingUserByUsername = await User.findOne({ where: { username } });
      if (existingUserByUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }
  
      // Kiểm tra nếu email đã tồn tại
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
  
      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Tạo người dùng mới
      const otp = generateOtp();
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        admin: false,
        created_at: new Date(),
        updated_at: new Date(),
      });
  
      // Lưu OTP vào bộ nhớ tạm (memory store)
      otpStore[newUser.id] = { otp, expires: Date.now() + 300000 }; // OTP hết hạn sau 5 phút
      await sendOtpEmail(newUser.email, otp);
  
      res.status(200).json({ message: "Register successfully! Code OTP sent to your email.", user: newUser });
    } catch (err) {
      console.error('Error details:', err);
      res.status(500).json({ error: 'Register failed! Please try again.' });
    }
  },

  // Verify OTP
  verifyOtp: async (req: Request, res: Response) => {
    const { userId, otp } = req.body;

    // Kiểm tra xem OTP có tồn tại và chưa hết hạn không
    const storedOtpData = otpStore[userId];
    if (!storedOtpData) {
      return res.status(400).json({ error: "OTP is invalid or expired" });
    }

    if (storedOtpData.otp === otp) {
      // Kiểm tra xem OTP có hết hạn không
      if (Date.now() > storedOtpData.expires) {
        delete otpStore[userId];  // Xóa OTP đã hết hạn
        return res.status(400).json({ error: "OTP has expired" });
      }
      delete otpStore[userId];  // Xóa OTP sau khi đã xác thực thành công
      return res.status(200).json({ message: "OTP verified successfully!" });
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  },

  // Resend OTP
  resendOtp: async (req: Request, res: Response) => {
    const { userId } = req.body;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Tạo OTP mới và lưu lại trong bộ nhớ tạm
      const newOtp = generateOtp();
      otpStore[user.id] = { otp: newOtp, expires: Date.now() + 300000 }; 
      await sendOtpEmail(user.email, newOtp);

      res.status(200).json({ message: "A new OTP has been sent to your email." });
    } catch (error) {
      console.error("Error resending OTP: ", error);
      res.status(500).json({ error: "Failed to resend OTP. Please try again." });
    }
  },

  // Generate Access Token
  generateAccessToken: (user: User) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.SECRET_KEY as string,
      { expiresIn: "300s" }  
    );
  },

  // Generate Refresh Token
  generateRefreshToken: (user: User) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.REFRESH_KEY as string,
      { expiresIn: "1d" }  // Hết hạn sau 1 ngày
    );
  },

  // Login User
  loginUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });
      if (!user) {
        res.status(404).json("Wrong username");
        return;
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        res.status(404).json("Wrong password");
        return;
      }
  
      const accessToken = authController.generateAccessToken(user);
      const refreshToken = authController.generateRefreshToken(user);
  
      // Lưu Refresh Token vào CSDL
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 1 day
      const newRefreshToken = await RefreshToken.create({
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
       
      });
      console.log('New refresh token created:', newRefreshToken);
  
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,  // Đặt thành true nếu đang chạy HTTPS
        path: "/",
        sameSite: "strict",
      });
  
      const userData = user.toJSON();
      const { password: userPassword, ...others } = userData;
      res.status(200).json({ user: others, accessToken });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Request Refresh Token
  requestRefreshToken: async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json("You aren't authenticated");
    }
  
    try {
      // Kiểm tra refresh token trong CSDL
      const tokenRecord = await RefreshToken.findOne({ where: { token: refreshToken }, include: { model: User, as: 'user' } });
      if (!tokenRecord) {
        return res.status(403).json("Refresh token is not valid");
      }
  
      // Kiểm tra xem token có hết hạn không
      if (tokenRecord.expires_at < new Date()) {
        return res.status(403).json("Refresh token has expired");
      }
  
      // Tạo access token và refresh token mới
      const newAccessToken = authController.generateAccessToken(tokenRecord.user as User);
      const newRefreshToken = authController.generateRefreshToken(tokenRecord.user as User);
  
      // Cập nhật lại refresh token trong CSDL
      await tokenRecord.update({
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),  // Cập nhật lại thời gian hết hạn
      });
  
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
  
      res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error("Error requesting refresh token:", error);
      res.status(500).json({ error: "Error requesting refresh token." });
    }
  },

  userLogout: async (req: Request, res: Response): Promise<void> => {
    try {
      // Xóa cookie chứa refresh token
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,  // Đặt là true nếu bạn sử dụng HTTPS
        path: '/',
        sameSite: 'strict',
      });

      res.status(200).json({ message: 'User logged out successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Something went wrong during logout' });
    }
  },

};

export default authController;



