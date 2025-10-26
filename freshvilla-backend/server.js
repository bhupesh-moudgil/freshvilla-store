require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize'); // Removed - causes readonly property errors
// const hpp = require('hpp'); // Removed - causes readonly property errors
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { connectDB } = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for frontend
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://freshvilla.in',
  'https://freshvilla.in',
  'http://www.freshvilla.in',
  'https://www.freshvilla.in',
  'https://bhupesh-moudgil.github.io',
  'https://freshvilla-backend.onrender.com', // Add your actual Render URL here
  /\.onrender\.com$/ // Allow all Render subdomains
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow no origin (e.g., mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      }
      // If it's a regex pattern
      return allowed.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many password reset requests, please try again later'
});

app.use('/api/', apiLimiter);

// Cookie Parser with signed cookies
app.use(cookieParser(process.env.COOKIE_SECRET || 'fallback-secret-change-in-production'));

// Session Configuration with secure settings
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  name: 'sessionId', // Don't use default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent JavaScript access
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict', // CSRF protection
    domain: process.env.NODE_ENV === 'production' ? '.freshvilla.in' : undefined
  },
  rolling: true // Reset expiration on activity
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Advanced Input Sanitization (XSS, SQL, NoSQL, Command Injection)
const { sanitizeInput } = require('./src/middleware/sanitize');
app.use(sanitizeInput);

// Data Sanitization against NoSQL Injection
// Handled by sanitizeInput middleware (custom implementation)
// mongoSanitize package removed due to Express compatibility issues

// Parameter Pollution Prevention (manual implementation)
// HPP package removed due to Express compatibility issues
// Protection handled by sanitizeInput middleware

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/customer/auth', require('./src/routes/customerAuth'));
app.use('/api/password-reset', require('./src/routes/passwordReset'));
app.use('/api/settings', require('./src/routes/settings'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/coupons', require('./src/routes/coupons'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/seed', require('./src/routes/seed'));
app.use('/api/upload', require('./src/routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'FreshVilla Backend Server Running',
    timestamp: new Date().toISOString()
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 FreshVilla Backend Server`);
  console.log(`📍 Running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
