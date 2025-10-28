const { Review, ReviewHelpfulness } = require('../../models');
const { Op } = require('sequelize');

class ReviewController {
  // Create review
  async createReview(req, res) {
    try {
      const {
        productId,
        customerId,
        orderId,
        rating,
        title,
        comment,
        images = [],
        videos = [],
      } = req.body;

      // Check if customer has already reviewed this product
      const existingReview = await Review.findOne({
        where: { productId, customerId },
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product',
        });
      }

      // Check if verified purchase
      const isVerifiedPurchase = orderId ? true : false;

      const review = await Review.create({
        productId,
        customerId,
        orderId,
        rating,
        title,
        comment,
        images,
        videos,
        isVerifiedPurchase,
      });

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (error) {
      console.error('Create review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create review',
        error: error.message,
      });
    }
  }

  // Get reviews for a product
  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const {
        page = 1,
        limit = 10,
        rating,
        verifiedOnly = false,
        sortBy = 'createdAt',
        order = 'DESC',
      } = req.query;

      const offset = (page - 1) * limit;
      const where = { productId, status: 'approved', isVisible: true };

      if (rating) where.rating = parseInt(rating);
      if (verifiedOnly === 'true') where.isVerifiedPurchase = true;

      const { count, rows } = await Review.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, order]],
      });

      // Calculate rating summary
      const ratingSummary = await Review.findAll({
        where: { productId, status: 'approved' },
        attributes: [
          'rating',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['rating'],
        raw: true,
      });

      const avgRating = await Review.findOne({
        where: { productId, status: 'approved' },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'average'],
        ],
        raw: true,
      });

      return res.status(200).json({
        success: true,
        data: rows,
        summary: {
          averageRating: parseFloat(avgRating?.average || 0).toFixed(1),
          totalReviews: count,
          ratingDistribution: ratingSummary,
        },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Get product reviews error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
        error: error.message,
      });
    }
  }

  // Get pending reviews (Admin/Moderator)
  async getPendingReviews(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await Review.findAndCountAll({
        where: { status: 'pending' },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'ASC']],
      });

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Get pending reviews error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch pending reviews',
        error: error.message,
      });
    }
  }

  // Approve review (Admin/Moderator)
  async approveReview(req, res) {
    try {
      const { id } = req.params;
      const { moderatedBy } = req.body;

      const review = await Review.findByPk(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      await review.approve(moderatedBy);

      return res.status(200).json({
        success: true,
        message: 'Review approved successfully',
        data: review,
      });
    } catch (error) {
      console.error('Approve review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to approve review',
        error: error.message,
      });
    }
  }

  // Reject review (Admin/Moderator)
  async rejectReview(req, res) {
    try {
      const { id } = req.params;
      const { moderatedBy, moderationNote } = req.body;

      const review = await Review.findByPk(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      await review.update({
        status: 'rejected',
        moderatedBy,
        moderatedAt: new Date(),
        moderationNote,
      });

      return res.status(200).json({
        success: true,
        message: 'Review rejected',
        data: review,
      });
    } catch (error) {
      console.error('Reject review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reject review',
        error: error.message,
      });
    }
  }

  // Mark review as helpful
  async markHelpful(req, res) {
    try {
      const { id } = req.params;
      const { customerId, isHelpful } = req.body;

      // Check if already voted
      const existingVote = await ReviewHelpfulness.findOne({
        where: { reviewId: id, customerId },
      });

      if (existingVote) {
        // Update existing vote
        await existingVote.update({ isHelpful });
      } else {
        // Create new vote
        await ReviewHelpfulness.create({
          reviewId: id,
          customerId,
          isHelpful,
        });
      }

      // Update review helpfulness counts
      const helpfulCount = await ReviewHelpfulness.count({
        where: { reviewId: id, isHelpful: true },
      });

      const notHelpfulCount = await ReviewHelpfulness.count({
        where: { reviewId: id, isHelpful: false },
      });

      await Review.update(
        { helpfulCount, notHelpfulCount },
        { where: { id } }
      );

      return res.status(200).json({
        success: true,
        message: 'Vote recorded successfully',
      });
    } catch (error) {
      console.error('Mark helpful error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to record vote',
        error: error.message,
      });
    }
  }

  // Add distributor response
  async addDistributorResponse(req, res) {
    try {
      const { id } = req.params;
      const { distributorResponse, distributorRespondedBy } = req.body;

      const review = await Review.findByPk(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      await review.update({
        distributorResponse,
        distributorRespondedBy,
        distributorRespondedAt: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: 'Response added successfully',
        data: review,
      });
    } catch (error) {
      console.error('Add distributor response error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add response',
        error: error.message,
      });
    }
  }

  // Update review
  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, title, comment, images, videos } = req.body;

      const review = await Review.findByPk(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      if (!review.canEdit()) {
        return res.status(400).json({
          success: false,
          message: 'Review can only be edited within 48 hours',
        });
      }

      await review.update({ rating, title, comment, images, videos });

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      console.error('Update review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update review',
        error: error.message,
      });
    }
  }

  // Delete review
  async deleteReview(req, res) {
    try {
      const { id } = req.params;

      const review = await Review.findByPk(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      await review.destroy();

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      console.error('Delete review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete review',
        error: error.message,
      });
    }
  }
}

module.exports = new ReviewController();
