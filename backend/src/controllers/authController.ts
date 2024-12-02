import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendOtpEmail } from '../mailer';
import RefreshToken from '../models/Token';


let refreshTokens: string[] = [];
let otpStore: Record<string, { otp: string, expires: number }> = {};

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
  
      otpStore[newUser.id] = { otp, expires: Date.now() + 300000 };
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

    const storedOtpData = otpStore[userId];
    if (!storedOtpData) {
      return res.status(400).json({ error: "CODE OTP invalid or expired" });
    }

    if (storedOtpData.otp === otp) {
      if (Date.now() > storedOtpData.expires) {
        delete otpStore[userId];
        return res.status(400).json({ error: "CODE OTP Expired" });
      }
      delete otpStore[userId];
      return res.status(200).json({ message: "CODE OTP successfully" });
    } else {
      return res.status(400).json({ error: "CODE OTP Failed" });
    }
  },

  // Resend OTP API
  resendOtp: async (req: Request, res: Response) => {
    const { userId } = req.body;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

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
      { expiresIn: "1d" }
    );
  },

  // Login User
  loginUser: async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({ where: { username: req.body.username } });
      if (!user) {
        return res.status(404).json("Wrong username");
      }

      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return res.status(404).json("Wrong password");
      }

      if (user && validPassword) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });

        const userData = user.toJSON();
        const { password, ...others } = userData;
        return res.status(200).json({ user: others, accessToken });
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  requestRefreshToken: (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json("You aren't authenticated");
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh token is not valid");
    }

    jwt.verify(refreshToken, process.env.REFRESH_KEY as string, (err: any, user: any) => {
      if (err) {
        return res.status(403).json("Invalid refresh token");
      }

      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

      const newAccessToken = authController.generateAccessToken(user as User);
      const newRefreshToken = authController.generateRefreshToken(user as User);
      refreshTokens.push(newRefreshToken);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });

      return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
  },

  // Logout User
  userLogout: (req: Request, res: Response) => {
    refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
    res.clearCookie("refreshToken");
    res.status(200).json("Logged out successfully!");
  },
};

export default authController;
