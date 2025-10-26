const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

let transporter = null;

// Initialize transporter with settings from database or environment
async function initializeTransporter() {
  try {
    // Try to get settings from database first
    const smtpHost = await Settings.getByKey('smtp_host') || process.env.SMTP_HOST || 'smtp.mailgun.org';
    const smtpPort = await Settings.getByKey('smtp_port') || process.env.SMTP_PORT || 587;
    const smtpUser = await Settings.getByKey('smtp_user') || process.env.SMTP_USER;
    const smtpPassword = await Settings.getByKey('smtp_password') || process.env.SMTP_PASSWORD;

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ SMTP server is ready to send emails');
    console.log(`   Host: ${smtpHost}:${smtpPort}`);
    console.log(`   User: ${smtpUser}`);
  } catch (error) {
    console.error('⚠️  SMTP connection error:', error.message);
    console.log('   Email functionality will be disabled');
  }
}

// Initialize on module load
initializeTransporter();

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"FreshVilla" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Welcome email template
const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Welcome to FreshVilla!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0aad0a;">Welcome to FreshVilla!</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for signing up with FreshVilla. We're excited to have you on board!</p>
      <p>Start exploring our fresh products and enjoy hassle-free shopping.</p>
      <p>If you have any questions, feel free to reach out to us.</p>
      <br>
      <p>Best regards,<br>The FreshVilla Team</p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">
        This email was sent from FreshVilla. If you didn't sign up, please ignore this email.
      </p>
    </div>
  `;
  const text = `Welcome to FreshVilla! Hi ${userName}, Thank you for signing up. Start exploring our fresh products today!`;

  return sendEmail({ to: userEmail, subject, html, text });
};

// Password reset email template
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request - FreshVilla';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0aad0a;">Password Reset Request</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password for your FreshVilla account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #0aad0a; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      <br>
      <p>Best regards,<br>The FreshVilla Team</p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">
        For security reasons, never share this email with anyone.
      </p>
    </div>
  `;
  const text = `Password Reset Request. Hi ${userName}, Click this link to reset your password: ${resetUrl}. Link expires in 1 hour.`;

  return sendEmail({ to: userEmail, subject, html, text });
};

// Sign-in notification email (optional)
const sendSignInNotificationEmail = async (userEmail, userName, ipAddress, timestamp) => {
  const subject = 'New Sign-In to Your FreshVilla Account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0aad0a;">New Sign-In Detected</h2>
      <p>Hi ${userName},</p>
      <p>We detected a new sign-in to your FreshVilla account.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Time:</strong> ${timestamp}</p>
        <p><strong>IP Address:</strong> ${ipAddress}</p>
      </div>
      <p>If this was you, no action is needed.</p>
      <p>If you don't recognize this activity, please reset your password immediately and contact our support team.</p>
      <br>
      <p>Best regards,<br>The FreshVilla Team</p>
    </div>
  `;
  const text = `New sign-in detected at ${timestamp} from IP ${ipAddress}. If this wasn't you, reset your password immediately.`;

  return sendEmail({ to: userEmail, subject, html, text });
};

// Email verification template
const sendVerificationEmail = async (userEmail, userName, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const subject = 'Verify Your Email - FreshVilla';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0aad0a;">Verify Your Email</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for signing up with FreshVilla! Please verify your email address to activate your account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #0aad0a; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
      <p><strong>This link will expire in 24 hours.</strong></p>
      <br>
      <p>Best regards,<br>The FreshVilla Team</p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">
        If you didn't sign up for FreshVilla, please ignore this email.
      </p>
    </div>
  `;
  const text = `Verify your email for FreshVilla. Click this link: ${verificationUrl}. Link expires in 24 hours.`;

  return sendEmail({ to: userEmail, subject, html, text });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email for suspicious login
const sendSuspiciousLoginOTP = async (userEmail, userName, otp) => {
  const subject = 'Security Alert: Login Verification Required - FreshVilla';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff6b00;">⚠️ Security Verification Required</h2>
      <p>Hi ${userName},</p>
      <p>We detected multiple failed login attempts followed by a successful login to your account.</p>
      <p>For your security, please verify this login with the OTP code below:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 30px 0; text-align: center;">
        <h1 style="color: #0aad0a; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <p><strong>This OTP will expire in 10 minutes.</strong></p>
      <p>If this wasn't you, please change your password immediately and contact our support team.</p>
      <br>
      <p>Best regards,<br>The FreshVilla Team</p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">
        Never share your OTP with anyone. FreshVilla will never ask for your OTP via phone or email.
      </p>
    </div>
  `;
  const text = `Security Alert: Your FreshVilla login OTP is: ${otp}. Valid for 10 minutes. If this wasn't you, change your password immediately.`;

  return sendEmail({ to: userEmail, subject, html, text });
};

// Send OTP email for checkout verification
const sendCheckoutOTP = async (userEmail, userName, otp, orderTotal) => {
  const subject = 'Order Verification Code - FreshVilla';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0aad0a;">🛒 Complete Your Order</h2>
      <p>Hi ${userName},</p>
      <p>You're almost done! Please verify your order with the OTP code below:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 30px 0; text-align: center;">
        <h1 style="color: #0aad0a; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Order Amount:</strong> ₹${orderTotal}</p>
      </div>
      <p><strong>This OTP will expire in 10 minutes.</strong></p>
      <p>Enter this code on the checkout page to complete your order.</p>
      <br>
      <p>Best regards,<br>The FreshVilla Team</p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">
        This OTP is for your order verification. Never share it with anyone.
      </p>
    </div>
  `;
  const text = `Your FreshVilla checkout OTP is: ${otp}. Order amount: ₹${orderTotal}. Valid for 10 minutes.`;

  return sendEmail({ to: userEmail, subject, html, text });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSignInNotificationEmail,
  sendVerificationEmail,
  generateOTP,
  sendSuspiciousLoginOTP,
  sendCheckoutOTP
};
