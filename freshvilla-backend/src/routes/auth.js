const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { generateToken, protect } = require('../middleware/auth');
const { validate, validations } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true
});

// @route   POST /api/auth/register
// @desc    Register a new admin
// @access  Private (Super-admin only)
router.post('/register', protect, validations.adminRegister, validate, async (req, res) => {
  try {
    // Only super-admins can create new admins
    if (req.admin.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super-admins can create new admin accounts'
      });
    }
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(admin.id);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login admin
// @access  Public
router.post('/login', authLimiter, validations.adminLogin, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for admin (include password field)
    const admin = await Admin.scope('withPassword').findOne({ 
      where: { email: email.toLowerCase() }
    });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (admin.accountLockedUntil && admin.accountLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((admin.accountLockedUntil - new Date()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${minutesLeft} minute(s).`
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      // Increment failed attempts
      admin.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (admin.failedLoginAttempts >= 5) {
        admin.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await admin.save();
        return res.status(429).json({
          success: false,
          message: 'Account locked due to too many failed login attempts. Try again in 15 minutes.'
        });
      }
      
      await admin.save();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset failed attempts on successful login
    admin.failedLoginAttempts = 0;
    admin.accountLockedUntil = null;
    admin.lastLogin = Date.now();
    await admin.save();

    // Generate token
    const token = generateToken(admin.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
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

// @route   GET /api/auth/me
// @desc    Get current logged in admin
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: {
      admin: req.admin
    }
  });
});

module.exports = router;
