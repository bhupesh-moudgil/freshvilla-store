const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/promotion/couponController');

// Customer routes
router.get('/public', couponController.getPublicCoupons);
router.get('/code/:code', couponController.getCouponByCode);
router.post('/code/:code/validate', couponController.validateCoupon);

// Coupon application (during checkout)
router.post('/apply', couponController.applyCoupon);

// Admin routes
router.post('/', couponController.createCoupon);
router.get('/', couponController.getAllCoupons);
router.put('/:id', couponController.updateCoupon);
router.post('/:id/deactivate', couponController.deactivateCoupon);
router.get('/:id/stats', couponController.getCouponStats);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
