const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomerLoyalty = sequelize.define('CustomerLoyalty', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
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
  
  // Enrollment
  enrolledAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  enrollmentSource: {
    type: DataTypes.ENUM('signup', 'first_order', 'manual', 'import'),
    defaultValue: 'signup',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Points Balance
  pointsBalance: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  lifetimePointsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lifetimePointsRedeemed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lifetimePointsExpired: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Tier Information
  currentTierId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'loyalty_tiers',
      key: 'id',
    },
  },
  tierQualifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  nextTierThreshold: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Amount needed to reach next tier',
  },
  
  // Activity Metrics
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalSpend: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  lastOrderDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastPointsEarnedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastPointsRedeemedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Period Metrics (for tier evaluation)
  periodStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  periodSpend: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  periodOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Bonuses Received
  signupBonusReceived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  birthdayBonusReceivedYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  
  // Referrals
  referralCode: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true,
  },
  referredBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id',
    },
  },
  totalReferrals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Special Coupons
  exclusiveCouponsReceived: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  exclusiveCouponsUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Notifications
  pointsExpiryNotificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  nextExpiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  pointsExpiringCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'customer_loyalty',
  timestamps: true,
  indexes: [
    { fields: ['customerId'], unique: true },
    { fields: ['programId'] },
    { fields: ['currentTierId'] },
    { fields: ['pointsBalance'] },
    { fields: ['referralCode'], unique: true },
    { fields: ['isActive'] },
  ],
  hooks: {
    beforeCreate: async (customerLoyalty) => {
      // Generate unique referral code
      if (!customerLoyalty.referralCode) {
        const crypto = require('crypto');
        customerLoyalty.referralCode = 'FV' + crypto.randomBytes(4).toString('hex').toUpperCase();
      }
    },
  },
});

// Instance method to add points
CustomerLoyalty.prototype.addPoints = async function(points, source = 'order') {
  this.pointsBalance += points;
  this.lifetimePointsEarned += points;
  this.lastPointsEarnedDate = new Date();
  await this.save();
  return this;
};

// Instance method to redeem points
CustomerLoyalty.prototype.redeemPoints = async function(points) {
  if (points > this.pointsBalance) {
    throw new Error('Insufficient points balance');
  }
  this.pointsBalance -= points;
  this.lifetimePointsRedeemed += points;
  this.lastPointsRedeemedDate = new Date();
  await this.save();
  return this;
};

// Instance method to check tier upgrade eligibility
CustomerLoyalty.prototype.checkTierUpgrade = async function() {
  const LoyaltyTier = require('./LoyaltyTier');
  
  const nextTier = await LoyaltyTier.findOne({
    where: {
      programId: this.programId,
      minimumSpend: { [require('sequelize').Op.lte]: this.periodSpend },
      minimumOrders: { [require('sequelize').Op.lte]: this.periodOrders },
    },
    order: [['tierLevel', 'DESC']],
  });
  
  if (nextTier && (!this.currentTierId || nextTier.id !== this.currentTierId)) {
    return nextTier;
  }
  
  return null;
};

module.exports = CustomerLoyalty;
