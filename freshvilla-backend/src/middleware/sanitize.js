const validator = require('validator');

/**
 * Advanced input sanitization middleware
 * Protects against XSS, SQL Injection, NoSQL Injection, Command Injection
 */

// Dangerous patterns to detect
const DANGEROUS_PATTERNS = [
  // SQL Injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)|(-{2}|\/\*|\*\/|;)/gi,
  
  // NoSQL Injection patterns
  /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$regex|\$exists)/gi,
  
  // Command Injection patterns
  /(;|\||&|`|\$\(|<\(|>\(|\n|\r)/g,
  
  // Path Traversal
  /(\.\.\/|\.\.\\)/g,
  
  // Script tags and event handlers
  /(<script|<iframe|javascript:|onerror=|onload=|onclick=)/gi
];

/**
 * Check if string contains dangerous patterns
 */
function containsDangerousPattern(str) {
  if (typeof str !== 'string') return false;
  
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(str));
}

/**
 * Sanitize string - remove dangerous characters
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  // HTML escape
  str = validator.escape(str);
  
  // Remove null bytes
  str = str.replace(/\0/g, '');
  
  // Trim whitespace
  str = str.trim();
  
  return str;
}

/**
 * Deep sanitize object/array recursively
 */
function deepSanitize(obj, depth = 0) {
  // Prevent infinite recursion
  if (depth > 10) {
    throw new Error('Object depth limit exceeded');
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item, depth + 1));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if key contains dangerous patterns
      if (containsDangerousPattern(key)) {
        console.warn(`Dangerous pattern detected in key: ${key}`);
        continue; // Skip this property
      }
      
      sanitized[key] = deepSanitize(value, depth + 1);
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    // Check for dangerous patterns
    if (containsDangerousPattern(obj)) {
      console.warn(`Dangerous pattern detected in value: ${obj.substring(0, 50)}...`);
      return ''; // Return empty string for dangerous input
    }
    
    return sanitizeString(obj);
  }
  
  return obj;
}

/**
 * Middleware to sanitize request body, query, and params
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body only (query/params sanitization disabled due to Express readonly properties)
    if (req.body && Object.keys(req.body).length > 0) {
      req.body = deepSanitize(req.body);
    }
    
    // Note: Query and params sanitization temporarily disabled
    // TODO: Implement proper sanitization without reassigning readonly properties
    
    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid input data'
    });
  }
};

/**
 * Strict sanitization for sensitive operations (login, registration)
 */
const strictSanitize = (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check email format
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Check for dangerous patterns in password
    if (password && containsDangerousPattern(password)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password format'
      });
    }
    
    // Check for suspicious patterns in any field
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string' && containsDangerousPattern(value)) {
        console.warn(`Suspicious input detected in ${key}: ${value.substring(0, 50)}`);
        return res.status(400).json({
          success: false,
          message: `Invalid input in field: ${key}`
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Strict sanitization error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid input data'
    });
  }
};

/**
 * Validate file uploads
 */
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }
  
  const file = req.file || (req.files && req.files[0]);
  
  if (!file) {
    return next();
  }
  
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds 10MB limit'
    });
  }
  
  // Check file type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only images are allowed.'
    });
  }
  
  // Check filename for dangerous patterns
  if (containsDangerousPattern(file.originalname)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid filename'
    });
  }
  
  next();
};

module.exports = {
  sanitizeInput,
  strictSanitize,
  validateFileUpload,
  sanitizeString,
  containsDangerousPattern
};
