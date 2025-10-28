const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoyaltyRule = sequelize.define('LoyaltyRule', {
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
  
  ruleName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  ruleType: {
    type: DataTypes.ENUM(
      'earning_purchase',
      'earning_signup',
      'earning_referral',
      'earning_birthday',
      'earning_review',
      'earning_social_share',
      'earning_event',
      'redemption_discount',
      'redemption_product',
      'redemption_shipping',
      'bonus_first_order',
      'bonus_milestone'
    ),
    allowNull: false,
  },
  
  // Earning Rules
  pointsPerRupee: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Points earned per rupee spent',
  },
  fixedPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Fixed points for action (signup, review, etc.)',
  },
  
  // Conditions
  minimumOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  applicableCategories: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of category IDs',
  },
  applicableProducts: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of product IDs',
  },
  excludedCategories: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  excludedProducts: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  
  // Tier-specific
  applicableTiers: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of tier IDs, empty = all tiers',
  },
  tierMultiplierOverride: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: null,
    comment: 'Override tier multiplier for this rule',
  },
  
  // Redemption Rules
  redemptionPointsCost: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Points required to redeem',
  },
  redemptionValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Value in rupees when redeemed',
  },
  redemptionType: {
    type: DataTypes.ENUM('fixed_discount', 'percentage_discount', 'free_product', 'free_shipping'),
    allowNull: true,
  },
  redemptionDiscountPercent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  
  // Limits
  maxPointsPerTransaction: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0 = unlimited',
  },
  maxPointsPerDay: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0 = unlimited',
  },
  maxPointsPerCustomer: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Lifetime limit, 0 = unlimited',
  },
  maxRedemptionsPerOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  
  // Bonus Conditions
  bonusMultiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.0,
    comment: 'Multiplier for bonus events',
  },
  bonusStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  bonusEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  bonusDaysOfWeek: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of days [0-6], empty = all days',
  },
  
  // Time-based
  validFrom: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Priority
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Higher priority rules are applied first',
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isStackable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Can be combined with other rules',
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Statistics
  totalTimesApplied: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPointsAwarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'loyalty_rules',
  timestamps: true,
  indexes: [
    { fields: ['programId'] },
    { fields: ['ruleType'] },
    { fields: ['isActive'] },
    { fields: ['priority'] },
    { fields: ['validFrom', 'validUntil'] },
  ],
});

module.exports = LoyaltyRule;
