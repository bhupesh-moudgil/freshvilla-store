const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoyaltyPointLedger = sequelize.define('LoyaltyPointLedger', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  programId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'loyalty_programs',
      key: 'id',
    },
  },
  
  transactionType: {
    type: DataTypes.ENUM(
      'earned',
      'redeemed',
      'expired',
      'adjusted',
      'refunded',
      'bonus',
      'revoked'
    ),
    allowNull: false,
  },
  
  // Points
  pointsChange: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Positive for earn, negative for redeem/expire',
  },
  pointsBalance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Balance after this transaction',
  },
  
  // Source
  sourceType: {
    type: DataTypes.ENUM(
      'order',
      'signup',
      'referral',
      'birthday',
      'review',
      'social_share',
      'manual',
      'tier_bonus',
      'event',
      'expiry',
      'refund',
      'adjustment'
    ),
    allowNull: false,
  },
  sourceId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of related entity (order, review, etc.)',
  },
  sourceReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'External reference (order number, etc.)',
  },
  
  // Applied Rule
  ruleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'loyalty_rules',
      key: 'id',
    },
  },
  ruleDescription: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  
  // Tier at time of transaction
  tierId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'loyalty_tiers',
      key: 'id',
    },
  },
  tierMultiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.0,
    comment: 'Tier multiplier applied',
  },
  
  // Redemption Details
  redemptionValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Monetary value if redeemed',
  },
  redemptionOrderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  
  // Expiry
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'For earned points, when they expire',
  },
  isExpired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Metadata
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional context data',
  },
  
  // Admin actions
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Admin user who made manual adjustment',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes for manual adjustments',
  },
  
  // Reversal
  isReversed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reversalTransactionId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Points to ledger entry that reversed this one',
  },
  reversalReason: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'loyalty_point_ledger',
  timestamps: true,
  indexes: [
    { fields: ['customerId'] },
    { fields: ['programId'] },
    { fields: ['transactionType'] },
    { fields: ['sourceType'] },
    { fields: ['sourceId'] },
    { fields: ['ruleId'] },
    { fields: ['redemptionOrderId'] },
    { fields: ['expiresAt'] },
    { fields: ['isExpired'] },
    { fields: ['transactionDate'] },
    { fields: ['customerId', 'transactionDate'] },
  ],
});

module.exports = LoyaltyPointLedger;
