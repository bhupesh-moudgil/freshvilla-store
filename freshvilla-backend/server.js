require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://freshvilla.in',
  'https://freshvilla.in',
  'http://www.freshvilla.in',
  'https://www.freshvilla.in',
  'https://bhupesh-moudgil.github.io'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/coupons', require('./src/routes/coupons'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/seed', require('./src/routes/seed'));

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
