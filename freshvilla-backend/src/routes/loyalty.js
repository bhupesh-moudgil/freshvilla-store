const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { protect, adminOnly } = require('../middleware/auth');

// ===================================
// LOYALTY PROGRAM ROUTES (Admin only)
// ===================================
router.post('/programs', protect, adminOnly, loyaltyController.createProgram);
router.get('/programs', protect, loyaltyController.getPrograms);
router.get('/programs/:id', protect, loyaltyController.getProgram);
router.put('/programs/:id', protect, adminOnly, loyaltyController.updateProgram);
router.delete('/programs/:id', protect, adminOnly, loyaltyController.deleteProgram);

// ===================================
// LOYALTY TIER ROUTES (Admin only for CUD)
// ===================================
router.post('/tiers', protect, adminOnly, loyaltyController.createTier);
router.get('/tiers/:programId', protect, loyaltyController.getTiers);
router.put('/tiers/:id', protect, adminOnly, loyaltyController.updateTier);
router.delete('/tiers/:id', protect, adminOnly, loyaltyController.deleteTier);

// ===================================
// LOYALTY RULE ROUTES (Admin only for CUD)
// ===================================
router.post('/rules', protect, adminOnly, loyaltyController.createRule);
router.get('/rules/:programId', protect, loyaltyController.getRules);
router.put('/rules/:id', protect, adminOnly, loyaltyController.updateRule);
router.delete('/rules/:id', protect, adminOnly, loyaltyController.deleteRule);

// ===================================
// CUSTOMER LOYALTY ROUTES
// ===================================
router.post('/customer/:customerId/enroll', protect, loyaltyController.enrollCustomer);
router.get('/customer/:customerId', protect, loyaltyController.getCustomerLoyalty);
router.post('/customer/:customerId/points', protect, loyaltyController.awardPoints);
router.post('/customer/:customerId/redeem', protect, loyaltyController.redeemPoints);
router.get('/customer/:customerId/history', protect, loyaltyController.getPointsHistory);
router.get('/customer/:customerId/tier-check', protect, loyaltyController.checkTierUpgrade);

// ===================================
// LOYALTY COUPON ROUTES
// ===================================
router.post('/coupons', protect, adminOnly, loyaltyController.createCoupon);
router.get('/coupons', protect, loyaltyController.getCoupons);
router.post('/coupons/:id/claim', protect, loyaltyController.claimCoupon);
router.get('/coupons/customer/:customerId', protect, loyaltyController.getCustomerCoupons);

// ===================================
// LOYALTY DASHBOARD (Admin only)
// ===================================
router.get('/dashboard/:programId', protect, adminOnly, loyaltyController.getDashboard);

module.exports = router;
