const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart/cartController');

// Cart operations
router.post('/get-or-create', cartController.getOrCreateCart);
router.get('/:cartId', cartController.getCart);
router.post('/:cartId/items', cartController.addItem);
router.put('/items/:itemId', cartController.updateItemQuantity);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/:cartId/clear', cartController.clearCart);

// Cart merge (on login)
router.post('/merge', cartController.mergeCart);

// Coupon
router.post('/:cartId/coupon', cartController.applyCoupon);

// Admin routes
router.get('/abandoned/all', cartController.getAbandonedCarts);

module.exports = router;
