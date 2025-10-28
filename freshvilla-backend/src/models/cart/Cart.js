const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Customer or Guest
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  guestToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Token for guest cart identification',
  },
  
  // Session Info
  sessionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('active', 'abandoned', 'converted', 'merged'),
    defaultValue: 'active',
  },
  
  // Pricing Summary (cached)
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  
  // Applied Coupons
  couponCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  
  // Selected Address & Delivery
  shippingAddressId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'customer_addresses',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  
  // Device & Location
  deviceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Conversion Tracking
  convertedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  
  // Expiry
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Cart expiration time',
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  
  // Last Activity
  lastActivityAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
}, {
  tableName: 'carts',
  timestamps: true,
  indexes: [
    { fields: ['customerId'] },
    { fields: ['guestToken'] },
    { fields: ['sessionId'] },
    { fields: ['status'] },
    { fields: ['expiresAt'] },
    { fields: ['lastActivityAt'] },
  ],
});

// Instance method to check if cart is expired
Cart.prototype.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > new Date(this.expiresAt);
};

// Instance method to update activity timestamp
Cart.prototype.touch = async function() {
  this.lastActivityAt = new Date();
  await this.save();
};

module.exports = Cart;
