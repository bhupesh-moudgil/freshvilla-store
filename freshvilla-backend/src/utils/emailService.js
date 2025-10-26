const nodemailer = require('nodemailer');

// Create transporter using Mailgun SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailgun.org',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

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

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSignInNotificationEmail
};
