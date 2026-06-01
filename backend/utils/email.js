const nodemailer = require('nodemailer');

// Check if SMTP is properly configured
const isSmtpConfigured = () => {
  return process.env.SMTP_USER && 
         process.env.SMTP_USER !== 'your_email@gmail.com' && 
         process.env.SMTP_PASS && 
         process.env.SMTP_PASS !== 'your_app_password_here' &&
         process.env.SMTP_PASS !== 'paste_your_16_char_app_password_here';
};

let transporter = null;

const getTransporter = () => {
  if (!transporter && isSmtpConfigured()) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

/**
 * Send email — returns { success, dev, otp? }
 * In dev mode (no SMTP), returns the OTP in the response so frontend can show it
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    let transport = getTransporter();
    let dev = false;
    let previewUrl = null;

    if (!transport) {
      console.log(`  📧 No SMTP configured. Creating temporary Ethereal SMTP account...`);
      const testAccount = await nodemailer.createTestAccount();
      transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      dev = true;
      console.log(`  🔬 Ethereal SMTP created: ${testAccount.user}`);
    }

    const info = await transport.sendMail({
      from: `"${process.env.FROM_NAME || 'AgroChain'}" <${process.env.SMTP_USER || 'no-reply@agrochain.com'}>`,
      to,
      subject,
      html
    });

    console.log(`  📧 Email sent to ${to}: ${info.messageId}`);
    
    if (dev) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`  📬 Preview Sent Email: ${previewUrl}`);
      return { success: true, dev: true, previewUrl };
    }

    return { success: true, messageId: info.messageId, dev: false };
  } catch (error) {
    console.error(`  ❌ Email error: ${error.message}`);
    console.log(`  ⚠️ Email delivery failed. Falling back to console log.`);
    return { success: false, error: error.message, dev: true };
  }
};

/**
 * Send OTP verification email
 */
const sendOTPEmail = async (email, otp, name) => {
  const result = await sendEmail({
    to: email,
    subject: '🌾 AgroChain — Verify Your Email',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0f1a; color: #f1f5f9; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px;">🌾 AgroChain</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Supply Chain Transparency Platform</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #94a3b8; font-size: 14px;">Use the following OTP to verify your email address:</p>
          <div style="background: #111827; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #10b981;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">⏱ This OTP expires in <strong>10 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 13px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #111827; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
          <p>AgroChain — Blockchain-Based Agricultural Supply Chain</p>
        </div>
      </div>
    `
  });

  // In dev mode, attach OTP to result so API can return it to frontend
  if (result.dev) {
    result.otp = otp;
  }
  return result;
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken, name) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  const result = await sendEmail({
    to: email,
    subject: '🔒 AgroChain — Password Reset Request',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0f1a; color: #f1f5f9; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px;">🌾 AgroChain</h1>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #94a3b8;">You requested a password reset. Click the button below:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 13px;">⏱ This link expires in <strong>30 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 12px; word-break: break-all;">Or copy: ${resetUrl}</p>
        </div>
      </div>
    `
  });
  if (result.dev) {
    result.resetUrl = resetUrl;
  }
  return result;
};

/**
 * Send transaction notification email
 */
const sendTransactionEmail = async (email, name, txDetails) => {
  return sendEmail({
    to: email,
    subject: `🔗 AgroChain — ${txDetails.type} Notification`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0f1a; color: #f1f5f9; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 20px;">🌾 Transaction Alert</h1>
        </div>
        <div style="padding: 24px;">
          <p>Hello <strong>${name}</strong>,</p>
          <p style="color: #94a3b8;">${txDetails.message}</p>
          <div style="background: #111827; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px;">
            <p><strong>Produce:</strong> ${txDetails.cropType} (${txDetails.produceId})</p>
            <p><strong>Quantity:</strong> ${txDetails.quantity} ${txDetails.unit}</p>
            <p><strong>Price:</strong> ₹${txDetails.price}/${txDetails.unit}</p>
            ${txDetails.blockHash ? `<p style="color: #64748b; font-size: 12px; word-break: break-all;"><strong>Block:</strong> ${txDetails.blockHash}</p>` : ''}
          </div>
        </div>
      </div>
    `
  });
};

module.exports = { sendEmail, sendOTPEmail, sendPasswordResetEmail, sendTransactionEmail, isSmtpConfigured };
