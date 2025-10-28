const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoyaltyCoupon = sequelize.define('LoyaltyCoupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  programId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'loyalty_programs',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  
  // Coupon Code
  couponCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  couponName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  
  // Type
  couponType: {
    type: DataTypes.ENUM(
      'tier_exclusive',
      'points_redemption',
      'birthday_reward',
      'anniversary_reward',
      'milestone_reward',
      'referral_reward'
    ),
    allowNull: false,
  },
  
  // Tier Restrictions
  requiredTierId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'loyalty_tiers',
      key: 'id',
    },
    comment: 'Null = available to all tiers',
  },
  minimumTierLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0 = all tiers',
  },
  
  // Points Cost
  pointsCost: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Points required to claim, 0 = free',
  },
  
  // Discount Details
  discountType: {
    type: DataTypes.ENUM('fixed', 'percentage', 'free_shipping', 'free_product'),
    allowNull: false,
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Maximum discount cap for percentage discounts',
  },
  
  // Conditions
  minimumOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  applicableCategories: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Empty = all categories',
  },
  applicableProducts: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Empty = all products',
  },
  excludedCategories: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  excludedProducts: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  
  // Usage Limits
  maxUsagePerCustomer: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  maxTotalUsage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0 = unlimited',
  },
  currentUsageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Validity
  validFrom: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  daysValidAfterClaim: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Days valid after customer claims it, 0 = uses validUntil',
  },
  
  // Auto-distribution
  autoDistribute: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Auto-send to eligible customers',
  },
  autoDistributeTrigger: {
    type: DataTypes.ENUM('birthday', 'anniversary', 'tier_upgrade', 'milestone'),
    allowNull: true,
  },
  
  // Stackability
  isStackable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Can be combined with other coupons',
  },
  canCombineWithPointsRedemption: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Display
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  displayBadge: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Badge text like "VIP Only", "Birthday Special"',
  },
  iconUrl: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Statistics
  totalClaimed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalRedeemed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Revenue from orders using this coupon',
  },
}, {
  tableName: 'loyalty_coupons',
  timestamps: true,
  indexes: [
    { fields: ['couponCode'], unique: true },
    { fields: ['programId'] },
    { fields: ['requiredTierId'] },
    { fields: ['couponType'] },
    { fields: ['isActive'] },
    { fields: ['validFrom', 'validUntil'] },
    { fields: ['pointsCost'] },
  ],
});

module.exports = LoyaltyCoupon;
