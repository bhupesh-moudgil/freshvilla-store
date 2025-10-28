const express = require('express');
const router = express.Router();
const internalTransferController = require('../controllers/internalTransferController');
const { protect, adminOnly } = require('../middleware/auth');

// Statistics (admin only)
router.get('/stats', protect, adminOnly, internalTransferController.getTransferStats);

// CRUD operations
router.post('/', protect, internalTransferController.createTransfer);
router.get('/', protect, internalTransferController.getTransfers);
router.get('/:id', protect, internalTransferController.getTransfer);

// Workflow operations
router.put('/:id/approve', protect, internalTransferController.approveTransfer);
router.put('/:id/ship', protect, internalTransferController.shipTransfer);
router.put('/:id/receive', protect, internalTransferController.receiveTransfer);
router.delete('/:id', protect, internalTransferController.cancelTransfer);

module.exports = router;
