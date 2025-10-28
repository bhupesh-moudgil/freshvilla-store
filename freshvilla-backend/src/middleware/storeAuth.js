const jwt = require('jsonwebtoken');
const StoreUser = require('../models/StoreUser');

// Protect store user routes
exports.protectStoreUser = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if it's a store user token
      if (decoded.type !== 'store_user') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type',
        });
      }

      // Get store user from database
      const storeUser = await StoreUser.findByPk(decoded.id);

      if (!storeUser) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists',
        });
      }

      // Check if user is active
      if (storeUser.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated',
        });
      }

      // Attach user to request
      req.user = storeUser;
      req.storeId = storeUser.storeId;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    console.error('Store auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Require specific permission
exports.requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!req.user.can(resource, action)) {
      return res.status(403).json({
        success: false,
        message: `You do not have permission to ${action} ${resource}`,
      });
    }

    next();
  };
};

// Verify store access
exports.verifyStoreAccess = (req, res, next) => {
  const { storeId } = req.params;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  // Check if user belongs to the store
  if (req.user.storeId !== storeId) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this store',
    });
  }

  next();
};

// Require specific role
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = exports;
