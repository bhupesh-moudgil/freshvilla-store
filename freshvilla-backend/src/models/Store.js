const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Contact Information
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Address
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Business Details
  gstNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fssaiNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Operating Hours
  openingTime: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '09:00',
  },
  closingTime: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '21:00',
  },
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Commission and Payments
  commission: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 15.00,
    comment: 'Platform commission percentage',
  },
  // Statistics
  totalProducts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0,
  },
  // Store Owner/Manager
  ownerId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Reference to Admin/User who owns this store',
  },
}, {
  tableName: 'stores',
  timestamps: true,
  indexes: [
    {
      fields: ['slug'],
    },
    {
      fields: ['isActive'],
    },
    {
      fields: ['isFeatured'],
    },
  ],
});

module.exports = Store;
