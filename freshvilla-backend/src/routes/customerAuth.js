const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { sendVerificationEmail } = require('../utils/emailService');
const { validate, validations } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true
});

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, type: 'customer' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @route   POST /api/customer/auth/register
// @desc    Register new customer
// @access  Public
router.post('/register', validations.customerRegister, validate, async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Check if customer exists
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create customer
    const customer = await Customer.create({
      name,
      email,
      password,
      mobile
    });

    // Generate verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    customer.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    await customer.save();

    // Send verification email (non-blocking)
    sendVerificationEmail(customer.email, customer.name, verificationToken).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    const token = generateToken(customer.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          mobile: customer.mobile
        },
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/customer/auth/login
// @desc    Customer login
// @access  Public
router.post('/login', authLimiter, validations.customerLogin, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get customer with password
    const customer = await Customer.scope('withPassword').findOne({ 
      where: { email: email.toLowerCase() }
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (customer.accountLockedUntil && customer.accountLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((customer.accountLockedUntil - new Date()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${minutesLeft} minute(s).`
      });
    }

    // Check password
    const isPasswordValid = await customer.comparePassword(password);
    if (!isPasswordValid) {
      // Increment failed attempts
      customer.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (customer.failedLoginAttempts >= 5) {
        customer.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await customer.save();
        return res.status(429).json({
          success: false,
          message: 'Account locked due to too many failed login attempts. Try again in 15 minutes.'
        });
      }
      
      await customer.save();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset failed attempts on successful login
    customer.failedLoginAttempts = 0;
    customer.accountLockedUntil = null;
    customer.lastLogin = new Date();
    await customer.save();

    const token = generateToken(customer.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          mobile: customer.mobile
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/customer/auth/me
// @desc    Get current customer
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Get token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findByPk(decoded.id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
});

// @route   POST /api/customer/auth/verify-email
// @desc    Verify customer email
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const customer = await Customer.findOne({
      where: { emailVerificationToken: tokenHash }
    });

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    customer.emailVerified = true;
    customer.emailVerificationToken = null;
    await customer.save();

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
});

module.exports = router;
