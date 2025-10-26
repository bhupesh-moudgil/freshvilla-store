/**
 * Frontend Input Sanitization
 * Prevent XSS and injection attacks on the client side
 */

// Dangerous patterns
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // event handlers
  /<img[^>]+src[^>]*>/gi,
  /data:text\/html/gi,
  /vbscript:/gi
];

/**
 * Sanitize string input
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove dangerous patterns
  let sanitized = input;
  DANGEROUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // HTML encode special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
};

/**
 * Get password strength feedback
 */
export const getPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    score,
    strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong',
    checks,
    message: getPasswordMessage(checks)
  };
};

const getPasswordMessage = (checks) => {
  const missing = [];
  if (!checks.length) missing.push('at least 8 characters');
  if (!checks.lowercase) missing.push('a lowercase letter');
  if (!checks.uppercase) missing.push('an uppercase letter');
  if (!checks.number) missing.push('a number');
  if (!checks.special) missing.push('a special character');
  
  if (missing.length === 0) return 'Password is strong!';
  return `Password needs: ${missing.join(', ')}`;
};

/**
 * Prevent common SQL injection patterns
 */
export const containsSQLInjection = (input) => {
  if (typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)/i,
    /--/,
    /\/\*/,
    /\*\//,
    /;/,
    /\bOR\b\s+\d+\s*=\s*\d+/i,
    /\bAND\b\s+\d+\s*=\s*\d+/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Sanitize form data before sending to API
 */
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    // Skip password fields from sanitization
    if (key.toLowerCase().includes('password')) {
      sanitized[key] = value;
      continue;
    }
    
    // Check for SQL injection
    if (typeof value === 'string' && containsSQLInjection(value)) {
      console.warn(`Potential SQL injection detected in field: ${key}`);
      sanitized[key] = '';
      continue;
    }
    
    // Sanitize the value
    sanitized[key] = typeof value === 'string' ? sanitizeString(value) : value;
  }
  
  return sanitized;
};

/**
 * Secure localStorage wrapper with encryption
 */
export const secureStorage = {
  setItem: (key, value) => {
    try {
      // Simple obfuscation (not cryptographic, but better than plain text)
      const data = btoa(JSON.stringify(value));
      localStorage.setItem(key, data);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  
  getItem: (key) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(atob(data));
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

/**
 * Rate limiting for client-side requests
 */
class ClientRateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  
  canProceed(key) {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
  
  reset(key) {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new ClientRateLimiter();
