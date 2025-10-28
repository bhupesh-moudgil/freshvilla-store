const express = require('express');
const router = express.Router();
const storeKYCController = require('../../controllers/distributor/storeKYCController');

// Distributor routes
router.post('/:distributorId/submit', storeKYCController.submitStoreKYC);
router.get('/:distributorId', storeKYCController.getStoreKYC);
router.put('/:distributorId', storeKYCController.updateStoreKYC);

// Admin routes
router.get('/pending/all', storeKYCController.getPendingStoreKYC);
router.post('/:distributorId/verify', storeKYCController.verifyStoreKYC);
router.post('/:distributorId/reject', storeKYCController.rejectStoreKYC);
router.get('/stats/overview', storeKYCController.getStoreKYCStats);

module.exports = router;
