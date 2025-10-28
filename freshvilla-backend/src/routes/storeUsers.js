const express = require('express');
const router = express.Router();
const storeUserController = require('../controllers/storeUserController');
const { protectStoreUser } = require('../middleware/storeAuth');

// Public routes
router.post('/login', storeUserController.storeUserLogin);
router.get('/roles', storeUserController.getRoleDefinitions);

// Protected routes (require authentication)
router.use(protectStoreUser);

// User management
router.get('/:storeId/users', storeUserController.getStoreUsers);
router.post('/:storeId/users/invite', storeUserController.inviteUser);
router.get('/:storeId/users/:userId', storeUserController.getUserDetails);
router.put('/:storeId/users/:userId', storeUserController.updateUser);
router.delete('/:storeId/users/:userId', storeUserController.deleteUser);

// Password management
router.post('/:storeId/users/:userId/change-password', storeUserController.changePassword);
router.post('/:storeId/users/:userId/reset-password', storeUserController.resetUserPassword);

module.exports = router;
