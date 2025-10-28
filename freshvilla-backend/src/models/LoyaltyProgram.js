const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoyaltyProgram = sequelize.define('LoyaltyProgram', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  programName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    defaultValue: 'FreshVilla Rewards',
  },
  programCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    defaultValue: 'FVREWARDS',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Program Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  
  // Point Configuration
  pointsPerRupee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1.0,
    comment: 'Points earned per rupee spent',
  },
  minimumOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Minimum order to earn points',
  },
  pointsValueInRupees: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0.25,
    comment: 'Redemption value: 1 point = X rupees',
  },
  minimumRedemptionPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Minimum points to redeem',
  },
  maximumRedemptionPercent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 50,
    comment: 'Max % of order total that can be paid with points',
  },
  
  // Point Expiry
  pointsExpiryEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  pointsExpiryDays: {
    type: DataTypes.INTEGER,
    defaultValue: 365,
    comment: 'Days after which points expire',
  },
  expiryNotificationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Days before expiry to notify customer',
  },
  
  // Tier System
  tierSystemEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  tierEvaluationPeriod: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'yearly', 'lifetime'),
    defaultValue: 'yearly',
  },
  
  // Bonus Events
  signupBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Welcome bonus points',
  },
  birthdayBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 200,
    comment: 'Birthday bonus points',
  },
  referralBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
    comment: 'Referral bonus points',
  },
  reviewBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    comment: 'Points for product review',
  },
  
  // Rules & Restrictions
  excludedCategories: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Product categories that don\'t earn points',
  },
  excludedPaymentMethods: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Payment methods that don\'t earn points',
  },
  multipleEarningAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Can earn points with coupons',
  },
  
  // Special Features
  doublePointsDays: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    comment: 'Days of week (0-6) with double points',
  },
  specialEventMultiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.0,
    comment: 'Points multiplier during special events',
  },
  
  // Notifications
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  smsNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Terms & Conditions
  termsAndConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Statistics
  totalMembersEnrolled: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPointsIssued: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },
  totalPointsRedeemed: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },
  totalPointsExpired: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'loyalty_programs',
  timestamps: true,
  indexes: [
    { fields: ['isActive'] },
    { fields: ['programCode'], unique: true },
  ],
});

// Instance method to check if program is currently active
LoyaltyProgram.prototype.isCurrentlyActive = function() {
  if (!this.isActive) return false;
  
  const today = new Date();
  if (this.startDate && new Date(this.startDate) > today) return false;
  if (this.endDate && new Date(this.endDate) < today) return false;
  
  return true;
};

// Instance method to calculate points for an order
LoyaltyProgram.prototype.calculatePointsForOrder = function(orderAmount, orderDate = new Date()) {
  if (!this.isCurrentlyActive()) return 0;
  if (orderAmount < this.minimumOrderAmount) return 0;
  
  let points = Math.floor(orderAmount * parseFloat(this.pointsPerRupee));
  
  // Double points on specific days
  const dayOfWeek = orderDate.getDay();
  if (this.doublePointsDays.includes(dayOfWeek)) {
    points *= 2;
  }
  
  // Special event multiplier
  if (this.specialEventMultiplier > 1) {
    points = Math.floor(points * parseFloat(this.specialEventMultiplier));
  }
  
  return points;
};

// Instance method to calculate redemption value
LoyaltyProgram.prototype.calculateRedemptionValue = function(points) {
  return parseFloat(points) * parseFloat(this.pointsValueInRupees);
};

// Instance method to check if points can be redeemed
LoyaltyProgram.prototype.canRedeem = function(points, orderTotal) {
  if (points < this.minimumRedemptionPoints) return false;
  
  const redemptionValue = this.calculateRedemptionValue(points);
  const maxAllowed = (orderTotal * this.maximumRedemptionPercent) / 100;
  
  return redemptionValue <= maxAllowed;
};

module.exports = LoyaltyProgram;
