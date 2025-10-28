const express = require('express');
const router = express.Router();
const adminStoreUserController = require('../controllers/adminStoreUserController');
const { protect, authorize } = require('../middleware/auth');

// All routes require super-admin authentication
router.use(protect);
router.use(authorize('super-admin'));

// Store management
router.get('/stores', adminStoreUserController.getAllStores);
router.get('/stores/:storeId/users', adminStoreUserController.getStoreUsers);

// Store owner management
router.post('/stores/:storeId/create-owner', adminStoreUserController.createStoreOwner);
router.post('/stores/:storeId/transfer-ownership/:userId', adminStoreUserController.transferOwnership);

// Store user management
router.post('/stores/:storeId/invite-user', adminStoreUserController.inviteUserToStore);
router.put('/stores/:storeId/users/:userId', adminStoreUserController.updateStoreUser);
router.delete('/stores/:storeId/users/:userId', adminStoreUserController.deleteStoreUser);

// Stats
router.get('/stats', adminStoreUserController.getStoreUserStats);

module.exports = router;
