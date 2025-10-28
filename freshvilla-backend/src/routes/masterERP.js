const express = require('express');
const router = express.Router();
const { protect, restrictToSuperAdmin } = require('../middleware/auth');
const masterERPController = require('../controllers/masterERPController');

// All routes require super admin authentication
router.use(protect);
router.use(restrictToSuperAdmin);

// @route   GET /api/master-erp/dashboard
// @desc    Get master dashboard overview (pan-India metrics)
// @access  Private (Super Admin only)
router.get('/dashboard', masterERPController.getMasterDashboard);

// @route   GET /api/master-erp/sales-analytics
// @desc    Get sales analytics across all stores
// @access  Private (Super Admin only)
router.get('/sales-analytics', masterERPController.getSalesAnalytics);

// @route   GET /api/master-erp/stores
// @desc    Get all stores list
// @access  Private (Super Admin only)
router.get('/stores', masterERPController.getAllStores);

// @route   GET /api/master-erp/store-comparison
// @desc    Compare performance of multiple stores
// @access  Private (Super Admin only)
router.get('/store-comparison', masterERPController.getStoreComparison);

// @route   GET /api/master-erp/revenue-by-category
// @desc    Get revenue breakdown by product category (pan-India)
// @access  Private (Super Admin only)
router.get('/revenue-by-category', masterERPController.getRevenueByCategory);

module.exports = router;
