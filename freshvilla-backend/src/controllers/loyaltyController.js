const { Op } = require('sequelize');
const LoyaltyProgram = require('../models/LoyaltyProgram');
const LoyaltyTier = require('../models/LoyaltyTier');
const LoyaltyRule = require('../models/LoyaltyRule');
const LoyaltyPointLedger = require('../models/LoyaltyPointLedger');
const CustomerLoyalty = require('../models/CustomerLoyalty');
const LoyaltyCoupon = require('../models/LoyaltyCoupon');
const Customer = require('../models/Customer');
const sequelize = require('../config/database');

// ===================================
// LOYALTY PROGRAM MANAGEMENT
// ===================================

// @desc    Create loyalty program
// @route   POST /api/loyalty/programs
// @access  Private (Admin only)
exports.createProgram = async (req, res) => {
  try {
    const program = await LoyaltyProgram.create(req.body);
    
    res.status(201).json({
      success: true,
      data: program,
      message: 'Loyalty program created successfully'
    });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all loyalty programs
// @route   GET /api/loyalty/programs
// @access  Private
exports.getPrograms = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const programs = await LoyaltyProgram.findAll({
      where,
      include: [
        {
          model: LoyaltyTier,
          as: 'tiers',
          order: [['tierLevel', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single loyalty program
// @route   GET /api/loyalty/programs/:id
// @access  Private
exports.getProgram = async (req, res) => {
  try {
    const program = await LoyaltyProgram.findByPk(req.params.id, {
      include: [
        {
          model: LoyaltyTier,
          as: 'tiers',
          order: [['tierLevel', 'ASC']]
        },
        {
          model: LoyaltyRule,
          as: 'rules',
          where: { isActive: true },
          required: false
        }
      ]
    });
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update loyalty program
// @route   PUT /api/loyalty/programs/:id
// @access  Private (Admin only)
exports.updateProgram = async (req, res) => {
  try {
    const program = await LoyaltyProgram.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    await program.update(req.body);
    
    res.json({
      success: true,
      data: program,
      message: 'Program updated successfully'
    });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete loyalty program
// @route   DELETE /api/loyalty/programs/:id
// @access  Private (Admin only)
exports.deleteProgram = async (req, res) => {
  try {
    const program = await LoyaltyProgram.findByPk(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    await program.destroy();
    
    res.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===================================
// LOYALTY TIER MANAGEMENT
// ===================================

// @desc    Create loyalty tier
// @route   POST /api/loyalty/tiers
// @access  Private (Admin only)
exports.createTier = async (req, res) => {
  try {
    const tier = await LoyaltyTier.create(req.body);
    
    res.status(201).json({
      success: true,
      data: tier,
      message: 'Tier created successfully'
    });
  } catch (error) {
    console.error('Create tier error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get tiers for a program
// @route   GET /api/loyalty/tiers/:programId
// @access  Private
exports.getTiers = async (req, res) => {
  try {
    const tiers = await LoyaltyTier.findAll({
      where: { programId: req.params.programId },
      order: [['tierLevel', 'ASC']]
    });
    
    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    console.error('Get tiers error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update loyalty tier
// @route   PUT /api/loyalty/tiers/:id
// @access  Private (Admin only)
exports.updateTier = async (req, res) => {
  try {
    const tier = await LoyaltyTier.findByPk(req.params.id);
    
    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Tier not found'
      });
    }
    
    await tier.update(req.body);
    
    res.json({
      success: true,
      data: tier,
      message: 'Tier updated successfully'
    });
  } catch (error) {
    console.error('Update tier error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete loyalty tier
// @route   DELETE /api/loyalty/tiers/:id
// @access  Private (Admin only)
exports.deleteTier = async (req, res) => {
  try {
    const tier = await LoyaltyTier.findByPk(req.params.id);
    
    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Tier not found'
      });
    }
    
    await tier.destroy();
    
    res.json({
      success: true,
      message: 'Tier deleted successfully'
    });
  } catch (error) {
    console.error('Delete tier error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===================================
// LOYALTY RULE MANAGEMENT
// ===================================

// @desc    Create loyalty rule
// @route   POST /api/loyalty/rules
// @access  Private (Admin only)
exports.createRule = async (req, res) => {
  try {
    const rule = await LoyaltyRule.create(req.body);
    
    res.status(201).json({
      success: true,
      data: rule,
      message: 'Rule created successfully'
    });
  } catch (error) {
    console.error('Create rule error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get rules for a program
// @route   GET /api/loyalty/rules/:programId
// @access  Private
exports.getRules = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const where = { programId: req.params.programId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const rules = await LoyaltyRule.findAll({
      where,
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update loyalty rule
// @route   PUT /api/loyalty/rules/:id
// @access  Private (Admin only)
exports.updateRule = async (req, res) => {
  try {
    const rule = await LoyaltyRule.findByPk(req.params.id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
    
    await rule.update(req.body);
    
    res.json({
      success: true,
      data: rule,
      message: 'Rule updated successfully'
    });
  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete loyalty rule
// @route   DELETE /api/loyalty/rules/:id
// @access  Private (Admin only)
exports.deleteRule = async (req, res) => {
  try {
    const rule = await LoyaltyRule.findByPk(req.params.id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
    
    await rule.destroy();
    
    res.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===================================
// CUSTOMER LOYALTY MANAGEMENT
// ===================================

// @desc    Enroll customer in loyalty program
// @route   POST /api/loyalty/customer/:customerId/enroll
// @access  Private
exports.enrollCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { programId } = req.body;
    
    // Check if customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if already enrolled
    const existing = await CustomerLoyalty.findOne({
      where: { customerId }
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Customer already enrolled in loyalty program'
      });
    }
    
    // Get program details
    const program = await LoyaltyProgram.findByPk(programId);
    if (!program || !program.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Active loyalty program not found'
      });
    }
    
    // Create loyalty enrollment
    const customerLoyalty = await CustomerLoyalty.create({
      customerId,
      programId,
      enrollmentSource: req.body.source || 'manual',
      periodStartDate: new Date()
    });
    
    // Award signup bonus if configured
    if (program.signupBonusPoints > 0) {
      await customerLoyalty.addPoints(program.signupBonusPoints, 'signup');
      customerLoyalty.signupBonusReceived = true;
      await customerLoyalty.save();
      
      // Record in ledger
      await LoyaltyPointLedger.create({
        customerId,
        programId,
        transactionType: 'earned',
        pointsChange: program.signupBonusPoints,
        pointsBalance: program.signupBonusPoints,
        sourceType: 'signup',
        description: 'Signup bonus points'
      });
    }
    
    res.status(201).json({
      success: true,
      data: customerLoyalty,
      message: 'Customer enrolled successfully'
    });
  } catch (error) {
    console.error('Enroll customer error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get customer loyalty status
// @route   GET /api/loyalty/customer/:customerId
// @access  Private
exports.getCustomerLoyalty = async (req, res) => {
  try {
    const customerLoyalty = await CustomerLoyalty.findOne({
      where: { customerId: req.params.customerId },
      include: [
        {
          model: LoyaltyProgram,
          as: 'program'
        },
        {
          model: LoyaltyTier,
          as: 'currentTier'
        }
      ]
    });
    
    if (!customerLoyalty) {
      return res.status(404).json({
        success: false,
        message: 'Customer not enrolled in loyalty program'
      });
    }
    
    res.json({
      success: true,
      data: customerLoyalty
    });
  } catch (error) {
    console.error('Get customer loyalty error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Award points to customer
// @route   POST /api/loyalty/customer/:customerId/points
// @access  Private
exports.awardPoints = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { points, sourceType, sourceId, sourceReference, description, ruleId } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid points amount'
      });
    }
    
    const customerLoyalty = await CustomerLoyalty.findOne({
      where: { customerId }
    });
    
    if (!customerLoyalty) {
      return res.status(404).json({
        success: false,
        message: 'Customer not enrolled in loyalty program'
      });
    }
    
    // Get program for expiry calculation
    const program = await LoyaltyProgram.findByPk(customerLoyalty.programId);
    let expiresAt = null;
    if (program.pointsExpiryDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + program.pointsExpiryDays);
    }
    
    // Award points
    await customerLoyalty.addPoints(points, sourceType);
    
    // Record in ledger
    await LoyaltyPointLedger.create({
      customerId,
      programId: customerLoyalty.programId,
      transactionType: 'earned',
      pointsChange: points,
      pointsBalance: customerLoyalty.pointsBalance,
      sourceType,
      sourceId,
      sourceReference,
      description,
      ruleId,
      tierId: customerLoyalty.currentTierId,
      expiresAt
    });
    
    // Check for tier upgrade
    const nextTier = await customerLoyalty.checkTierUpgrade();
    if (nextTier) {
      customerLoyalty.currentTierId = nextTier.id;
      customerLoyalty.tierQualifiedAt = new Date();
      await customerLoyalty.save();
    }
    
    res.json({
      success: true,
      data: {
        pointsAwarded: points,
        newBalance: customerLoyalty.pointsBalance,
        tierUpgrade: nextTier ? nextTier.tierName : null
      },
      message: 'Points awarded successfully'
    });
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Redeem points
// @route   POST /api/loyalty/customer/:customerId/redeem
// @access  Private
exports.redeemPoints = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { points, redemptionValue, orderId, description } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid points amount'
      });
    }
    
    const customerLoyalty = await CustomerLoyalty.findOne({
      where: { customerId }
    });
    
    if (!customerLoyalty) {
      return res.status(404).json({
        success: false,
        message: 'Customer not enrolled in loyalty program'
      });
    }
    
    if (customerLoyalty.pointsBalance < points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points balance'
      });
    }
    
    // Redeem points
    await customerLoyalty.redeemPoints(points);
    
    // Record in ledger
    await LoyaltyPointLedger.create({
      customerId,
      programId: customerLoyalty.programId,
      transactionType: 'redeemed',
      pointsChange: -points,
      pointsBalance: customerLoyalty.pointsBalance,
      sourceType: 'order',
      sourceId: orderId,
      redemptionValue: redemptionValue || 0,
      redemptionOrderId: orderId,
      description: description || 'Points redeemed for order discount',
      tierId: customerLoyalty.currentTierId
    });
    
    res.json({
      success: true,
      data: {
        pointsRedeemed: points,
        redemptionValue: redemptionValue || 0,
        newBalance: customerLoyalty.pointsBalance
      },
      message: 'Points redeemed successfully'
    });
  } catch (error) {
    console.error('Redeem points error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get customer points history
// @route   GET /api/loyalty/customer/:customerId/history
// @access  Private
exports.getPointsHistory = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 50, transactionType } = req.query;
    
    const where = { customerId };
    if (transactionType) {
      where.transactionType = transactionType;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await LoyaltyPointLedger.findAndCountAll({
      where,
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check tier upgrade eligibility
// @route   GET /api/loyalty/customer/:customerId/tier-check
// @access  Private
exports.checkTierUpgrade = async (req, res) => {
  try {
    const customerLoyalty = await CustomerLoyalty.findOne({
      where: { customerId: req.params.customerId },
      include: [
        {
          model: LoyaltyTier,
          as: 'currentTier'
        }
      ]
    });
    
    if (!customerLoyalty) {
      return res.status(404).json({
        success: false,
        message: 'Customer not enrolled in loyalty program'
      });
    }
    
    const nextTier = await customerLoyalty.checkTierUpgrade();
    
    if (nextTier) {
      // Get tier details
      const tierDetails = await LoyaltyTier.findByPk(nextTier.id);
      
      res.json({
        success: true,
        data: {
          eligible: true,
          currentTier: customerLoyalty.currentTier,
          nextTier: tierDetails,
          customerProgress: {
            totalSpend: customerLoyalty.periodSpend,
            totalOrders: customerLoyalty.periodOrders,
            pointsBalance: customerLoyalty.pointsBalance
          }
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          eligible: false,
          currentTier: customerLoyalty.currentTier,
          customerProgress: {
            totalSpend: customerLoyalty.periodSpend,
            totalOrders: customerLoyalty.periodOrders,
            pointsBalance: customerLoyalty.pointsBalance
          }
        }
      });
    }
  } catch (error) {
    console.error('Check tier upgrade error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===================================
// LOYALTY COUPON MANAGEMENT
// ===================================

// @desc    Create loyalty coupon
// @route   POST /api/loyalty/coupons
// @access  Private (Admin only)
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await LoyaltyCoupon.create(req.body);
    
    res.status(201).json({
      success: true,
      data: coupon,
      message: 'Loyalty coupon created successfully'
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get loyalty coupons
// @route   GET /api/loyalty/coupons
// @access  Private
exports.getCoupons = async (req, res) => {
  try {
    const { programId, couponType, isActive } = req.query;
    
    const where = {};
    if (programId) where.programId = programId;
    if (couponType) where.couponType = couponType;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    const coupons = await LoyaltyCoupon.findAll({
      where,
      include: [
        {
          model: LoyaltyTier,
          as: 'requiredTier',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Claim loyalty coupon
// @route   POST /api/loyalty/coupons/:id/claim
// @access  Private
exports.claimCoupon = async (req, res) => {
  try {
    const { customerId } = req.body;
    
    const coupon = await LoyaltyCoupon.findByPk(req.params.id);
    
    if (!coupon || !coupon.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not available'
      });
    }
    
    // Check validity
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Coupon not valid at this time'
      });
    }
    
    // Check customer loyalty and tier
    const customerLoyalty = await CustomerLoyalty.findOne({
      where: { customerId }
    });
    
    if (!customerLoyalty) {
      return res.status(400).json({
        success: false,
        message: 'Customer not enrolled in loyalty program'
      });
    }
    
    // Check tier eligibility
    if (coupon.requiredTierId && customerLoyalty.currentTierId !== coupon.requiredTierId) {
      return res.status(400).json({
        success: false,
        message: 'Tier requirement not met'
      });
    }
    
    // Check points cost
    if (coupon.pointsCost > 0) {
      if (customerLoyalty.pointsBalance < coupon.pointsCost) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient points to claim coupon'
        });
      }
      
      // Deduct points
      await customerLoyalty.redeemPoints(coupon.pointsCost);
      
      // Record in ledger
      await LoyaltyPointLedger.create({
        customerId,
        programId: customerLoyalty.programId,
        transactionType: 'redeemed',
        pointsChange: -coupon.pointsCost,
        pointsBalance: customerLoyalty.pointsBalance,
        sourceType: 'manual',
        description: `Claimed coupon: ${coupon.couponCode}`
      });
    }
    
    // Update coupon stats
    coupon.totalClaimed += 1;
    await coupon.save();
    
    // Update customer loyalty stats
    customerLoyalty.exclusiveCouponsReceived += 1;
    await customerLoyalty.save();
    
    res.json({
      success: true,
      data: {
        couponCode: coupon.couponCode,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        validUntil: coupon.validUntil
      },
      message: 'Coupon claimed successfully'
    });
  } catch (error) {
    console.error('Claim coupon error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get customer's available coupons
// @route   GET /api/loyalty/coupons/customer/:customerId
// @access  Private
exports.getCustomerCoupons = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customerLoyalty = await CustomerLoyalty.findOne({
      where: { customerId },
      include: [
        {
          model: LoyaltyTier,
          as: 'currentTier'
        }
      ]
    });
    
    if (!customerLoyalty) {
      return res.status(404).json({
        success: false,
        message: 'Customer not enrolled in loyalty program'
      });
    }
    
    const now = new Date();
    
    // Get available coupons
    const coupons = await LoyaltyCoupon.findAll({
      where: {
        programId: customerLoyalty.programId,
        isActive: true,
        validFrom: { [Op.lte]: now },
        validUntil: { [Op.gte]: now },
        [Op.or]: [
          { requiredTierId: null },
          { requiredTierId: customerLoyalty.currentTierId }
        ],
        pointsCost: { [Op.lte]: customerLoyalty.pointsBalance }
      },
      order: [['pointsCost', 'ASC']]
    });
    
    res.json({
      success: true,
      data: {
        customerTier: customerLoyalty.currentTier,
        pointsBalance: customerLoyalty.pointsBalance,
        availableCoupons: coupons
      }
    });
  } catch (error) {
    console.error('Get customer coupons error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===================================
// LOYALTY DASHBOARD
// ===================================

// @desc    Get loyalty program dashboard
// @route   GET /api/loyalty/dashboard/:programId
// @access  Private (Admin only)
exports.getDashboard = async (req, res) => {
  try {
    const { programId } = req.params;
    
    // Total enrolled customers
    const totalEnrolled = await CustomerLoyalty.count({
      where: { programId, isActive: true }
    });
    
    // Total points issued
    const pointsIssued = await LoyaltyPointLedger.sum('pointsChange', {
      where: {
        programId,
        transactionType: 'earned'
      }
    }) || 0;
    
    // Total points redeemed
    const pointsRedeemed = await LoyaltyPointLedger.sum('pointsChange', {
      where: {
        programId,
        transactionType: 'redeemed'
      }
    }) || 0;
    
    // Tier distribution
    const tierDistribution = await sequelize.query(`
      SELECT 
        lt."tierName",
        lt."tierLevel",
        COUNT(cl.id) as "memberCount"
      FROM loyalty_tiers lt
      LEFT JOIN customer_loyalty cl ON lt.id = cl."currentTierId"
      WHERE lt."programId" = :programId
      GROUP BY lt.id, lt."tierName", lt."tierLevel"
      ORDER BY lt."tierLevel" ASC
    `, {
      replacements: { programId },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Recent activities
    const recentActivities = await LoyaltyPointLedger.findAll({
      where: { programId },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['transactionDate', 'DESC']],
      limit: 10
    });
    
    // Top earners
    const topEarners = await CustomerLoyalty.findAll({
      where: { programId, isActive: true },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['lifetimePointsEarned', 'DESC']],
      limit: 10
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalEnrolled,
          pointsIssued: Math.abs(pointsIssued),
          pointsRedeemed: Math.abs(pointsRedeemed),
          redemptionRate: pointsIssued > 0 ? ((Math.abs(pointsRedeemed) / pointsIssued) * 100).toFixed(2) : 0
        },
        tierDistribution,
        recentActivities,
        topEarners
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
