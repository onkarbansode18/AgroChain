const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const router   = express.Router();
const User     = require('../models/User');
const OTP      = require('../models/OTP');
const { sendOTPEmail } = require('../services/emailService');
const { protect } = require('../middleware/auth');

// Send OTP (Registration Step 1)
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const otp = crypto.randomInt(100000, 999999).toString();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendOTPEmail(email, name, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP and Register (Registration Step 2)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, used: false });
    if (!otpRecord) return res.status(400).json({ message: 'OTP not found. Request a new one.' });
    if (otpRecord.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > otpRecord.expiresAt) return res.status(400).json({ message: 'OTP expired' });
    await OTP.updateOne({ _id: otpRecord._id }, { used: true });
    const blockchainAddress = crypto.createHash('sha256').update(email + Date.now()).digest('hex');
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'consumer',
      blockchainAddress,
      emailVerified: true,
      isEmailVerified: true
    });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified, emailVerified: user.emailVerified },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        blockchainAddress: user.blockchainAddress,
        isEmailVerified: user.isEmailVerified,
        emailVerified: user.emailVerified
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get Me
router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Failed to get user details' });
  }
});

// Verify Email (for already registered logged-in users on /verify-email screen)
router.post('/verify-email', protect, async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.user.email;
    const otpRecord = await OTP.findOne({ email, used: false });
    if (!otpRecord) return res.status(400).json({ message: 'OTP not found. Request a new one.' });
    if (otpRecord.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > otpRecord.expiresAt) return res.status(400).json({ message: 'OTP expired' });

    await OTP.updateOne({ _id: otpRecord._id }, { used: true });
    await User.updateOne({ _id: req.user._id }, { isEmailVerified: true, emailVerified: true });

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Resend OTP (for already registered logged-in users on /verify-email screen)
router.post('/resend-otp', protect, async (req, res) => {
  try {
    const email = req.user.email;
    const name = req.user.name;
    const otp = crypto.randomInt(100000, 999999).toString();
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendOTPEmail(email, name, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found with this email' });
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
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

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🌾 AgroChain — Reset Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; background: #f9f9f9;">
          <h2 style="color: #2e7d32;">🌾 Reset Your Password</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Please reset your password by clicking the link below:</p>
          <div style="text-align:center; margin: 30px 0;">
            <a href="${resetUrl}" style="font-size: 16px; font-weight: bold; color: white; background: #2e7d32; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link expires in 30 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password reset link sent successfully' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send password reset email' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = req.body.password; // Triggers User.js pre('save') to hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Password reset failed' });
  }
});

// Update Profile
router.put('/profile', protect, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change Password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

module.exports = router;
