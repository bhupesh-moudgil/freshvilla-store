const express = require('express');
const router = express.Router();
const internalInvoiceController = require('../controllers/internalInvoiceController');
const { protect, adminOnly } = require('../middleware/auth');

// Statistics and pending (admin only)
router.get('/stats', protect, adminOnly, internalInvoiceController.getInvoiceStats);
router.get('/pending', protect, internalInvoiceController.getPendingInvoices);

// CRUD operations
router.post('/', protect, internalInvoiceController.createInvoice);
router.get('/', protect, internalInvoiceController.getInvoices);
router.get('/:id', protect, internalInvoiceController.getInvoice);
router.put('/:id', protect, adminOnly, internalInvoiceController.updateInvoice);
router.delete('/:id', protect, adminOnly, internalInvoiceController.cancelInvoice);

// Payment operations
router.put('/:id/pay', protect, internalInvoiceController.recordPayment);

// Invoice actions
router.put('/:id/issue', protect, internalInvoiceController.issueInvoice);

// PDF operations
router.post('/:id/generate-pdf', protect, internalInvoiceController.generatePDF);
router.get('/:id/download-pdf', protect, internalInvoiceController.downloadPDF);

module.exports = router;
