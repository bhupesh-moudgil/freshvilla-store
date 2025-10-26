const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Customer = require('../models/Customer');
const { sendPasswordResetEmail } = require('../utils/emailService');
const { validate, validations } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests'
});

// @route   POST /api/password-reset/request
// @desc    Request password reset (send email)
// @access  Public
router.post('/request', passwordResetLimiter, validations.passwordResetRequest, validate, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find customer
    const customer = await Customer.findOne({ 
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration
    if (!customer) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store token in database with 1 hour expiration
    customer.resetPasswordToken = tokenHash;
    customer.resetPasswordExpires = new Date(Date.now() + 3600000);
    await customer.save();

    // Send email
    await sendPasswordResetEmail(customer.email, customer.name, resetToken);

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
});

// @route   POST /api/password-reset/verify
// @desc    Verify reset token
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const customer = await Customer.findOne({
      where: {
        resetPasswordToken: tokenHash
      }
    });

    if (!customer || !customer.resetPasswordExpires || customer.resetPasswordExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify token'
    });
  }
});

// @route   POST /api/password-reset/reset
// @desc    Reset password with token
// @access  Public
router.post('/reset', validations.passwordReset, validate, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find customer with valid token
    const customer = await Customer.scope('withPassword').findOne({
      where: {
        resetPasswordToken: tokenHash
      }
    });
    
    if (!customer || !customer.resetPasswordExpires || customer.resetPasswordExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    customer.password = newPassword;
    customer.resetPasswordToken = null;
    customer.resetPasswordExpires = null;
    customer.failedLoginAttempts = 0;
    customer.accountLockedUntil = null;
    await customer.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

module.exports = router;
