const express = require('express');
const router = express.Router();
const distributorKYCController = require('../../controllers/distributor/distributorKYCController');

// Distributor routes
router.post('/upload', distributorKYCController.uploadDocument);
router.get('/distributor/:distributorId', distributorKYCController.getDistributorDocuments);
router.delete('/:id', distributorKYCController.deleteDocument);

// Admin routes
router.get('/pending', distributorKYCController.getPendingDocuments);
router.post('/:id/verify', distributorKYCController.verifyDocument);
router.post('/:id/reject', distributorKYCController.rejectDocument);

module.exports = router;
