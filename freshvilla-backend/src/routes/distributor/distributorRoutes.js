const express = require('express');
const router = express.Router();
const distributorController = require('../../controllers/distributor/distributorController');

// Public routes
router.post('/register', distributorController.register);

// Distributor routes (require distributor authentication)
router.get('/:id', distributorController.getDistributorById);
router.put('/:id', distributorController.updateDistributor);
router.get('/:distributorId/dashboard', distributorController.getDashboardStats);

// Admin routes (require admin authentication)
router.get('/', distributorController.getAllDistributors);
router.post('/:id/approve', distributorController.approveDistributor);
router.post('/:id/reject', distributorController.rejectDistributor);
router.post('/:id/suspend', distributorController.suspendDistributor);
router.delete('/:id', distributorController.deleteDistributor);

module.exports = router;
