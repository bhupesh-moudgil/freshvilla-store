const express = require('express');
const router = express.Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
const authRoutes = require('./auth');
const customerAuthRoutes = require('./customerAuth');
const passwordResetRoutes = require('./passwordReset');

// ==========================================
// DISTRIBUTOR ROUTES (ENTERPRISE B2B)
// ==========================================
const distributorRoutes = require('./distributor/distributorRoutes');
const distributorKYCRoutes = require('./distributor/distributorKYCRoutes');
const storeKYCRoutes = require('./distributor/storeKYCRoutes');

// ==========================================
// SUPPORT ROUTES (CHATWOOT-INSPIRED)
// ==========================================
const conversationRoutes = require('./support/conversationRoutes');
const messageRoutes = require('./support/messageRoutes');

// ==========================================
// REVIEW & RATING ROUTES
// ==========================================
const reviewRoutes = require('./review/reviewRoutes');

// ==========================================
// CART & CHECKOUT ROUTES
// ==========================================
const cartRoutes = require('./cart/cartRoutes');

// ==========================================
// PROMOTION ROUTES
// ==========================================
const couponRoutes = require('./promotion/couponRoutes');
const couponsLegacy = require('./coupons'); // Legacy coupon routes

// ==========================================
// PRODUCT & CATALOG ROUTES
// ==========================================
const productRoutes = require('./products');
const bannerRoutes = require('./banners');

// ==========================================
// ORDER MANAGEMENT ROUTES
// ==========================================
const orderRoutes = require('./orders');
const orderPrintingRoutes = require('./orderPrinting');

// ==========================================
// STORE & WAREHOUSE ROUTES
// ==========================================
const storeRoutes = require('./stores');
const warehouseRoutes = require('./warehouses');
const storeUserRoutes = require('./storeUsers');
const adminStoreUserRoutes = require('./adminStoreUsers');

// ==========================================
// ERP & INVENTORY ROUTES
// ==========================================
const masterERPRoutes = require('./masterERP');
const storeERPRoutes = require('./storeERP');
const internalTransferRoutes = require('./internalTransfers');
const internalInvoiceRoutes = require('./internalInvoices');

// ==========================================
// FINANCIAL ROUTES
// ==========================================
const creditNoteRoutes = require('./creditNotes');
const gstRoutes = require('./gst');

// ==========================================
// LOCATION & SERVICE AREA ROUTES
// ==========================================
const cityRoutes = require('./cities');
const serviceAreaRoutes = require('./serviceAreas');

// ==========================================
// LOYALTY & CUSTOMER ENGAGEMENT
// ==========================================
const loyaltyRoutes = require('./loyalty');

// ==========================================
// SYSTEM & UTILITY ROUTES
// ==========================================
const settingsRoutes = require('./settings');
const uploadRoutes = require('./upload');
const seedRoutes = require('./seed');

// ==========================================
// MOUNT AUTHENTICATION ROUTES
// ==========================================
router.use('/auth', authRoutes);
router.use('/customer-auth', customerAuthRoutes);
router.use('/password-reset', passwordResetRoutes);

// ==========================================
// MOUNT DISTRIBUTOR ROUTES
// ==========================================
router.use('/distributors', distributorRoutes);
router.use('/distributor-kyc', distributorKYCRoutes);
router.use('/store-kyc', storeKYCRoutes);

// ==========================================
// MOUNT SUPPORT ROUTES
// ==========================================
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);

// ==========================================
// MOUNT REVIEW ROUTES
// ==========================================
router.use('/reviews', reviewRoutes);

// ==========================================
// MOUNT CART ROUTES
// ==========================================
router.use('/cart', cartRoutes);

// ==========================================
// MOUNT PROMOTION ROUTES
// ==========================================
router.use('/coupons', couponRoutes); // New enterprise coupons
router.use('/coupons-legacy', couponsLegacy); // Legacy coupons

// ==========================================
// MOUNT PRODUCT ROUTES
// ==========================================
router.use('/products', productRoutes);
router.use('/banners', bannerRoutes);

// ==========================================
// MOUNT ORDER ROUTES
// ==========================================
router.use('/orders', orderRoutes);
router.use('/order-printing', orderPrintingRoutes);

// ==========================================
// MOUNT STORE & WAREHOUSE ROUTES
// ==========================================
router.use('/stores', storeRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/store-users', storeUserRoutes);
router.use('/admin/store-users', adminStoreUserRoutes);

// ==========================================
// MOUNT ERP ROUTES
// ==========================================
router.use('/master-erp', masterERPRoutes);
router.use('/store-erp', storeERPRoutes);
router.use('/internal-transfers', internalTransferRoutes);
router.use('/internal-invoices', internalInvoiceRoutes);

// ==========================================
// MOUNT FINANCIAL ROUTES
// ==========================================
router.use('/credit-notes', creditNoteRoutes);
router.use('/gst', gstRoutes);

// ==========================================
// MOUNT LOCATION ROUTES
// ==========================================
router.use('/cities', cityRoutes);
router.use('/service-areas', serviceAreaRoutes);

// ==========================================
// MOUNT LOYALTY ROUTES
// ==========================================
router.use('/loyalty', loyaltyRoutes);

// ==========================================
// MOUNT SYSTEM ROUTES
// ==========================================
router.use('/settings', settingsRoutes);
router.use('/upload', uploadRoutes);
router.use('/seed', seedRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FreshVilla Enterprise API is running',
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    features: {
      distributors: true,
      support: true,
      reviews: true,
      cart: true,
      coupons: true,
      realtime: true,
      erp: true,
    },
  });
});

// ==========================================
// API INFO
// ==========================================
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    api: 'FreshVilla Enterprise Backend',
    version: '2.0.0',
    features: [
      'Dual KYC System (Distributor + Store)',
      'Multi-channel Support (Chatwoot-inspired)',
      'Advanced Review System with Moderation',
      'Smart Cart with Guest/Login Merge',
      'Sophisticated Coupon Engine',
      'Real-time Chat (Socket.IO)',
      'Background Jobs (Bull + Redis)',
      'ERP & Inventory Management',
      'Multi-store/Multi-warehouse',
      'B2B + B2C Marketplace',
    ],
    endpoints: {
      auth: ['/api/v1/auth', '/api/v1/customer-auth'],
      distributors: ['/api/v1/distributors', '/api/v1/distributor-kyc', '/api/v1/store-kyc'],
      support: ['/api/v1/conversations', '/api/v1/messages'],
      reviews: ['/api/v1/reviews'],
      cart: ['/api/v1/cart'],
      products: ['/api/v1/products', '/api/v1/banners'],
      orders: ['/api/v1/orders'],
      stores: ['/api/v1/stores', '/api/v1/warehouses'],
      erp: ['/api/v1/master-erp', '/api/v1/store-erp'],
    },
  });
});

module.exports = router;
