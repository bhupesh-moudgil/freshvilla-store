const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { protect, restrictToSuperAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Dashboard
router.get('/:id/dashboard', warehouseController.getDashboard);

// Capacity reporting
router.get('/:id/capacity-report', warehouseController.getCapacityReport);

// Inventory management
router.get('/:id/inventory', warehouseController.getWarehouseInventory);
router.put('/:warehouseId/inventory/:inventoryId', warehouseController.updateInventory);
router.post('/:warehouseId/inventory/:inventoryId/adjust', warehouseController.adjustInventoryStock);

// CRUD operations (Super Admin only)
router.get('/', warehouseController.getAllWarehouses);
router.get('/:id', warehouseController.getWarehouse);
router.post('/', restrictToSuperAdmin, warehouseController.createWarehouse);
router.put('/:id', restrictToSuperAdmin, warehouseController.updateWarehouse);
router.delete('/:id', restrictToSuperAdmin, warehouseController.deleteWarehouse);

module.exports = router;
