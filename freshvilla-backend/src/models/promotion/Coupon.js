const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Coupon Code
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  
  // Basic Info
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Discount Configuration
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed', 'free_shipping'),
    allowNull: false,
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Percentage (1-100) or fixed amount',
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Maximum discount cap for percentage type',
  },
  
  // Validity Period
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  
  // Usage Limits
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total number of times coupon can be used',
  },
  usageLimitPerCustomer: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  currentUsageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Minimum Requirements
  minPurchaseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  minItemQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Restrictions
  applicableProducts: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'Specific product IDs if applicable',
  },
  applicableCategories: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'Specific category IDs if applicable',
  },
  applicableDistributors: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'Specific distributor IDs if applicable',
  },
  excludedProducts: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
  },
  
  // Customer Targeting
  applicableCustomerSegments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Customer segments (new, loyal, premium)',
  },
  specificCustomerIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'Exclusive to specific customers',
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Public coupons shown on site, private requires code',
  },
  
  // First Order Bonus
  firstOrderOnly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Stackability
  canStackWithOtherCoupons: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Creator
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  
}, {
  tableName: 'coupons',
  timestamps: true,
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['isActive'] },
    { fields: ['startDate', 'endDate'] },
    { fields: ['discountType'] },
  ],
});

// Instance method to check if coupon is valid
Coupon.prototype.isValid = function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (now < new Date(this.startDate) || now > new Date(this.endDate)) return false;
  if (this.usageLimit && this.currentUsageCount >= this.usageLimit) return false;
  return true;
};

// Instance method to calculate discount
Coupon.prototype.calculateDiscount = function(orderAmount) {
  if (this.discountType === 'percentage') {
    const discount = (orderAmount * parseFloat(this.discountValue)) / 100;
    if (this.maxDiscountAmount) {
      return Math.min(discount, parseFloat(this.maxDiscountAmount));
    }
    return discount;
  }
  if (this.discountType === 'fixed') {
    return parseFloat(this.discountValue);
  }
  return 0;
};

module.exports = Coupon;
