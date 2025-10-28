const express = require('express');
const router = express.Router();
const { protect, restrictToSuperAdmin } = require('../middleware/auth');
const storeController = require('../controllers/storeController');

// Public routes
// @route   GET /api/stores/url/:storeUrl
// @desc    Get store by URL (e.g., dl-ndl-001)
router.get('/url/:storeUrl', storeController.getStoreByUrl);

// @route   GET /api/stores/by-state/:stateCode
// @desc    Get stores by state code (e.g., DL, MH, KA)
router.get('/by-state/:stateCode', storeController.getStoresByState);

// @route   GET /api/stores/by-city/:cityCode
// @desc    Get stores by city code (e.g., NDL, MUM, BLR)
router.get('/by-city/:cityCode', storeController.getStoresByCity);

// Protected routes (require authentication)
router.use(protect);

// @route   GET /api/stores
// @desc    Get all stores with display info
router.get('/', storeController.getAllStores);

// @route   GET /api/stores/:id
// @desc    Get store by ID
router.get('/:id', storeController.getStoreById);

// Super admin only routes
router.use(restrictToSuperAdmin);

// @route   POST /api/stores
// @desc    Create new store with auto-generated URL
router.post('/', storeController.createStore);

// @route   PUT /api/stores/:id
// @desc    Update store
router.put('/:id', storeController.updateStore);

// @route   DELETE /api/stores/:id
// @desc    Delete store
router.delete('/:id', storeController.deleteStore);

module.exports = router;
