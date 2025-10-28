const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
  storeNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'Unique store number e.g., 001, 002',
  },
  storeUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'Store URL slug e.g., delhi-ndl-store-001',
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
  cityCode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'City/District code from indianCities.json e.g., NDL, MUM, BLR',
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stateCode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'State code e.g., DL, MH, KA',
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
  
  // Store Type Classification
  storeType: {
    type: DataTypes.ENUM('brand', 'integrated'),
    defaultValue: 'brand',
    allowNull: false,
    comment: 'brand = FreshVilla owned, integrated = 3rd party partnership',
  },
  
  // For Integrated Stores (3rd Party)
  partnerName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '3rd party partner/owner name',
  },
  partnerContact: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Partner contact person',
  },
  partnerEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  partnerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  partnershipDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date when partnership started',
  },
  partnershipStatus: {
    type: DataTypes.ENUM('active', 'inactive', 'terminated'),
    defaultValue: 'active',
  },
  commissionOverride: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Override commission for this integrated store',
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
