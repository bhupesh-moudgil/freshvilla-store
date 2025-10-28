const { Coupon, CouponUsage } = require('../../models');
const { Op } = require('sequelize');

class CouponController {
  // Create coupon (Admin)
  async createCoupon(req, res) {
    try {
      const {
        code,
        name,
        description,
        discountType,
        discountValue,
        maxDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        usageLimitPerCustomer,
        minPurchaseAmount,
        minItemQuantity,
        applicableProducts,
        applicableCategories,
        applicableDistributors,
        excludedProducts,
        applicableCustomerSegments,
        specificCustomerIds,
        isPublic,
        firstOrderOnly,
        canStackWithOtherCoupons,
        createdBy,
      } = req.body;

      // Check if coupon code already exists
      const existingCoupon = await Coupon.findOne({
        where: { code: code.toUpperCase() },
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists',
        });
      }

      const coupon = await Coupon.create({
        code: code.toUpperCase(),
        name,
        description,
        discountType,
        discountValue,
        maxDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        usageLimitPerCustomer,
        minPurchaseAmount,
        minItemQuantity,
        applicableProducts,
        applicableCategories,
        applicableDistributors,
        excludedProducts,
        applicableCustomerSegments,
        specificCustomerIds,
        isPublic,
        firstOrderOnly,
        canStackWithOtherCoupons,
        createdBy,
      });

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
      });
    } catch (error) {
      console.error('Create coupon error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create coupon',
        error: error.message,
      });
    }
  }

  // Get all coupons
  async getAllCoupons(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        isActive,
        discountType,
        search,
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (discountType) where.discountType = discountType;
      if (search) {
        where[Op.or] = [
          { code: { [Op.iLike]: `%${search}%` } },
          { name: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Coupon.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
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
      console.error('Get coupons error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch coupons',
        error: error.message,
      });
    }
  }

  // Get public/active coupons (Customer)
  async getPublicCoupons(req, res) {
    try {
      const now = new Date();

      const coupons = await Coupon.findAll({
        where: {
          isActive: true,
          isPublic: true,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now },
        },
        attributes: [
          'id',
          'code',
          'name',
          'description',
          'discountType',
          'discountValue',
          'maxDiscountAmount',
          'minPurchaseAmount',
          'endDate',
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: coupons,
      });
    } catch (error) {
      console.error('Get public coupons error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch public coupons',
        error: error.message,
      });
    }
  }

  // Get coupon by code
  async getCouponByCode(req, res) {
    try {
      const { code } = req.params;

      const coupon = await Coupon.findOne({
        where: { code: code.toUpperCase() },
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      console.error('Get coupon error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch coupon',
        error: error.message,
      });
    }
  }

  // Validate coupon
  async validateCoupon(req, res) {
    try {
      const { code } = req.params;
      const { customerId, orderAmount, itemCount } = req.body;

      const coupon = await Coupon.findOne({
        where: { code: code.toUpperCase() },
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      // Check if coupon is valid
      if (!coupon.isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Coupon is not valid or has expired',
        });
      }

      // Check minimum purchase amount
      if (
        coupon.minPurchaseAmount &&
        orderAmount < parseFloat(coupon.minPurchaseAmount)
      ) {
        return res.status(400).json({
          success: false,
          message: `Minimum purchase amount of ${coupon.minPurchaseAmount} required`,
        });
      }

      // Check minimum item quantity
      if (coupon.minItemQuantity && itemCount < coupon.minItemQuantity) {
        return res.status(400).json({
          success: false,
          message: `Minimum ${coupon.minItemQuantity} items required`,
        });
      }

      // Check usage limit per customer
      if (customerId && coupon.usageLimitPerCustomer) {
        const usageCount = await CouponUsage.count({
          where: { couponId: coupon.id, customerId },
        });

        if (usageCount >= coupon.usageLimitPerCustomer) {
          return res.status(400).json({
            success: false,
            message: 'You have reached the usage limit for this coupon',
          });
        }
      }

      // Calculate discount
      const discount = coupon.calculateDiscount(orderAmount);

      return res.status(200).json({
        success: true,
        message: 'Coupon is valid',
        data: {
          coupon,
          discount,
          finalAmount: orderAmount - discount,
        },
      });
    } catch (error) {
      console.error('Validate coupon error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate coupon',
        error: error.message,
      });
    }
  }

  // Apply coupon (record usage)
  async applyCoupon(req, res) {
    try {
      const { couponId, customerId, orderId, discountAmount, orderTotal } =
        req.body;

      const coupon = await Coupon.findByPk(couponId);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      // Record coupon usage
      const usage = await CouponUsage.create({
        couponId,
        customerId,
        orderId,
        discountAmount,
        orderTotal,
      });

      // Increment coupon usage count
      await coupon.increment('currentUsageCount');

      return res.status(201).json({
        success: true,
        message: 'Coupon applied successfully',
        data: usage,
      });
    } catch (error) {
      console.error('Apply coupon error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to apply coupon',
        error: error.message,
      });
    }
  }

  // Update coupon (Admin)
  async updateCoupon(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const coupon = await Coupon.findByPk(id);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      // Prevent updating certain fields
      delete updates.currentUsageCount;

      await coupon.update(updates);

      return res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon,
      });
    } catch (error) {
      console.error('Update coupon error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update coupon',
        error: error.message,
      });
    }
  }

  // Deactivate coupon (Admin)
  async deactivateCoupon(req, res) {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findByPk(id);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      await coupon.update({ isActive: false });

      return res.status(200).json({
        success: true,
        message: 'Coupon deactivated successfully',
        data: coupon,
      });
    } catch (error) {
      console.error('Deactivate coupon error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate coupon',
        error: error.message,
      });
    }
  }

  // Get coupon usage statistics
  async getCouponStats(req, res) {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findByPk(id, {
        include: [
          {
            model: CouponUsage,
            as: 'usages',
          },
        ],
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      const totalDiscount = await CouponUsage.sum('discountAmount', {
        where: { couponId: id },
      });

      const totalOrders = await CouponUsage.count({
        where: { couponId: id },
      });

      return res.status(200).json({
        success: true,
        data: {
          coupon,
          stats: {
            totalUsage: coupon.currentUsageCount,
            totalOrders,
            totalDiscount: totalDiscount || 0,
            remainingUses: coupon.usageLimit
              ? coupon.usageLimit - coupon.currentUsageCount
              : 'Unlimited',
          },
        },
      });
    } catch (error) {
      console.error('Get coupon stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch coupon statistics',
        error: error.message,
      });
    }
  }

  // Delete coupon (Admin)
  async deleteCoupon(req, res) {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findByPk(id);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      await coupon.destroy();

      return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
      });
    } catch (error) {
      console.error('Delete coupon error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete coupon',
        error: error.message,
      });
    }
  }
}

module.exports = new CouponController();
