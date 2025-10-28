const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CouponUsage = sequelize.define('CouponUsage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  couponId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'coupons',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  
  // Discount Applied
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  
  // Order Details
  orderTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  
  usedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  
}, {
  tableName: 'coupon_usage',
  timestamps: true,
  indexes: [
    { fields: ['couponId'] },
    { fields: ['customerId'] },
    { fields: ['orderId'] },
    { fields: ['usedAt'] },
    { fields: ['couponId', 'customerId'] },
  ],
});

module.exports = CouponUsage;
