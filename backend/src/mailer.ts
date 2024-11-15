import nodemailer from 'nodemailer';

// Tạo transporter với các thông tin cấu hình
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "ducthien0912.dev@gmail.com",
    pass: "dimt dquc vrgj xrqe", 
  },
});

// Hàm gửi email OTP
export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: '"DUC THIEN" <ducthien0912.dev@gmail.com>', 
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + email);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};
