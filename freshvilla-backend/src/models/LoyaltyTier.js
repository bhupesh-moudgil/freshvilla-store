const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoyaltyTier = sequelize.define('LoyaltyTier', {
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
  
  tierName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'e.g., Bronze, Silver, Gold, Platinum',
  },
  tierLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tier hierarchy: 1=lowest, 4=highest',
  },
  tierColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#808080',
    comment: 'Hex color code for UI',
  },
  tierIcon: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  
  // Qualification Criteria
  minimumSpend: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Minimum spend to reach this tier',
  },
  minimumOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Minimum orders to reach this tier',
  },
  minimumPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Minimum points to reach this tier',
  },
  
  // Tier Benefits
  pointsMultiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.0,
    comment: 'Points multiplier for this tier (e.g., 1.5 = 50% bonus)',
  },
  bonusPointsPerMonth: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Free points awarded monthly',
  },
  freeShippingThreshold: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Order amount for free shipping (0 = always free)',
  },
  exclusiveDiscountPercent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Exclusive discount for this tier',
  },
  earlyAccessHours: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Hours of early access to sales',
  },
  dedicatedSupport: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Special Perks
  birthdayBonusMultiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.0,
  },
  referralBonusMultiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.0,
  },
  
  // Exclusive Coupons
  monthlyFreeCoupon: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  couponValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  benefits: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of benefit descriptions',
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Statistics
  totalMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'loyalty_tiers',
  timestamps: true,
  indexes: [
    { fields: ['programId'] },
    { fields: ['tierLevel'] },
    { fields: ['isActive'] },
  ],
});

module.exports = LoyaltyTier;
