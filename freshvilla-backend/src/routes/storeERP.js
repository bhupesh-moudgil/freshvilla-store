const express = require('express');
const router = express.Router();
const storeERPController = require('../controllers/storeERPController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and store role
router.use(protect);
router.use(authorize('store'));

// Dashboard
router.get('/:storeId/dashboard', storeERPController.getDashboard);

// Financial Transactions
router.get('/:storeId/transactions', storeERPController.getTransactions);

// Revenue & Reporting
router.get('/:storeId/revenue-summary', storeERPController.getRevenueSummary);
router.get('/:storeId/profit-loss', storeERPController.getProfitLoss);
router.get('/:storeId/sales-analytics', storeERPController.getSalesAnalytics);

// Inventory Management
router.get('/:storeId/inventory', storeERPController.getInventory);
router.get('/:storeId/inventory/ledger', storeERPController.getInventoryLedger);
router.post('/:storeId/inventory/adjust', storeERPController.adjustInventory);

// Commission Management
router.get('/:storeId/commissions', storeERPController.getProductCommissions);
router.put('/:storeId/commissions/:productId', storeERPController.updateProductCommission);

module.exports = router;
