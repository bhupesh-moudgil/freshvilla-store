const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Wishlist = sequelize.define('Wishlist', {
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
    onUpdate: 'CASCADE',
  },
  
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  
  // Optional variant
  variantId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Specific product variant',
  },
  
  // Priority/Notes
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Price Alert
  priceAlertEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  targetPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  
  // Stock Alert
  stockAlertEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Notifications Sent
  priceAlertSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  stockAlertSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
}, {
  tableName: 'wishlists',
  timestamps: true,
  indexes: [
    { fields: ['customerId'] },
    { fields: ['productId'] },
    { fields: ['customerId', 'productId'], unique: true },
    { fields: ['priceAlertEnabled'] },
    { fields: ['stockAlertEnabled'] },
  ],
});

module.exports = Wishlist;
