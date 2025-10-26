const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Store reset tokens temporarily (in production, use Redis or database)
const resetTokens = new Map();

// @route   POST /api/password-reset/request
// @desc    Request password reset (send email)
// @access  Public
router.post('/request', async (req, res) => {
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

    // Store token with expiration (1 hour)
    resetTokens.set(tokenHash, {
      customerId: customer.id,
      email: customer.email,
      expiresAt: Date.now() + 3600000 // 1 hour
    });

    // Clean up expired tokens
    for (const [key, value] of resetTokens.entries()) {
      if (value.expiresAt < Date.now()) {
        resetTokens.delete(key);
      }
    }

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
    const tokenData = resetTokens.get(tokenHash);

    if (!tokenData || tokenData.expiresAt < Date.now()) {
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
router.post('/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenData = resetTokens.get(tokenHash);

    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find customer and update password
    const customer = await Customer.scope('withPassword').findByPk(tokenData.customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.password = newPassword;
    await customer.save();

    // Delete used token
    resetTokens.delete(tokenHash);

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
