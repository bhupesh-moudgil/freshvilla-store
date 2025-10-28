const express = require('express');
const router = express.Router();
const gstController = require('../controllers/gstController');
const { protect, adminOnly } = require('../middleware/auth');

// All GST routes require admin access
router.use(protect);
router.use(adminOnly);

// Ledger
router.get('/ledger', gstController.getGSTLedger);

// Summary operations
router.get('/summary/:month/:year', gstController.getGSTSummary);
router.post('/summary/generate', gstController.generateGSTSummary);
router.put('/summary/:id/file', gstController.fileGSTReturn);

// Reports
router.get('/report/gstr1', gstController.getGSTR1Report);
router.get('/report/gstr3b', gstController.getGSTR3BReport);

// Store-wise summary
router.get('/store/:storeId/summary', gstController.getStoreGSTSummary);

module.exports = router;
