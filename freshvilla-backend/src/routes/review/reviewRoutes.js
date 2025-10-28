const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/review/reviewController');

// Customer routes
router.post('/', reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.put('/:id', reviewController.updateReview);
router.post('/:id/helpful', reviewController.markHelpful);

// Distributor routes
router.post('/:id/response', reviewController.addDistributorResponse);

// Admin/Moderator routes
router.get('/pending', reviewController.getPendingReviews);
router.post('/:id/approve', reviewController.approveReview);
router.post('/:id/reject', reviewController.rejectReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
