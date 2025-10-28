const express = require('express');
const router = express.Router();
const orderPrintController = require('../controllers/orderPrintController');
const { protectStoreUser, requirePermission } = require('../middleware/storeAuth');

// All routes require store user authentication with print permission
router.use(protectStoreUser);
router.use(requirePermission('orders', 'print'));

// Print endpoints
router.get('/:orderId/print/data', orderPrintController.getPrintData);
router.get('/:orderId/print/thermal', orderPrintController.printThermalReceipt);
router.get('/:orderId/print/invoice', orderPrintController.generateInvoicePDF);
router.get('/:orderId/print/label', orderPrintController.generateShippingLabel);

module.exports = router;
