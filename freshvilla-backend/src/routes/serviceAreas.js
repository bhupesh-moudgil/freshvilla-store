const express = require('express');
const router = express.Router();
const serviceAreaController = require('../controllers/serviceAreaController');
const { protectStoreUser, requirePermission } = require('../middleware/storeAuth');

// Public routes - check availability
router.get('/check-availability', serviceAreaController.checkServiceAvailability);
router.post('/route-order', serviceAreaController.routeOrder);
router.get('/delivery-estimate', serviceAreaController.getDeliveryEstimate);

// Protected routes - manage service areas (requires store user auth)
router.use(protectStoreUser);
router.use(requirePermission('settings', 'edit'));

router.get('/:storeId/areas', serviceAreaController.getServiceAreas);
router.post('/:storeId/areas', serviceAreaController.createServiceArea);
router.put('/:storeId/areas/:areaId', serviceAreaController.updateServiceArea);
router.delete('/:storeId/areas/:areaId', serviceAreaController.deleteServiceArea);

module.exports = router;
