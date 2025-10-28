const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get admin from database
      req.admin = await Admin.findByPk(decoded.id);
      
      if (!req.admin || !req.admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account not found or inactive'
        });
      }

      // Add store context from token if present
      req.selectedStoreId = decoded.storeId || null;
      
      // Check if super admin
      req.isSuperAdmin = req.admin.email === 'admin@freshvilla.in';

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Restrict to super admin only
exports.restrictToSuperAdmin = (req, res, next) => {
  if (!req.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};

// Role-based authorization middleware
// Usage: authorize('super-admin'), authorize('admin', 'distributor'), etc.
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.admin && !req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Check if super admin (always has access)
    if (req.isSuperAdmin) {
      return next();
    }

    // Get user's role from request
    const userRole = req.admin?.role || req.user?.role || 'customer';

    // Check if user's role is in allowed roles
    if (!roles.includes(userRole) && !roles.includes('super-admin')) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Admin only middleware (alias for restrictToSuperAdmin)
exports.adminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Admin access required.'
    });
  }
  if (!req.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};

// Generate JWT Token
exports.generateToken = (id, storeId = null) => {
  const payload = { id };
  if (storeId) payload.storeId = storeId;
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};
