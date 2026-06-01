const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (toEmail, userName, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: '🌾 AgroChain — Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; background: #f9f9f9;">
        <h2 style="color: #2e7d32;">🌾 Welcome to AgroChain</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your OTP to verify your email is:</p>
        <div style="text-align:center; margin: 30px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #2e7d32; background: #e8f5e9; padding: 15px 30px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, ignore this email.</p>
        <hr/>
        <p style="color: #ccc; font-size: 11px;">AgroChain — Farm to Consumer Transparency</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
