const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CustomerAddress = sequelize.define('CustomerAddress', {
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
  
  // Address Type
  addressType: {
    type: DataTypes.ENUM('home', 'work', 'other'),
    defaultValue: 'home',
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Custom label like "Office", "Parents Home"',
  },
  
  // Contact Person
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  alternatePhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  
  // Address Details
  addressLine1: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  addressLine2: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  landmark: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'India',
  },
  postalCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  
  // Geolocation
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  
  // Default Settings
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isDefaultBilling: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isDefaultShipping: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Metadata
  deliveryInstructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Verification
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
}, {
  tableName: 'customer_addresses',
  timestamps: true,
  indexes: [
    { fields: ['customerId'] },
    { fields: ['isDefault'] },
    { fields: ['postalCode'] },
    { fields: ['city'] },
  ],
});

// Instance method to format full address
CustomerAddress.prototype.getFullAddress = function() {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.landmark,
    this.city,
    this.state,
    this.postalCode,
    this.country,
  ].filter(Boolean);
  return parts.join(', ');
};

module.exports = CustomerAddress;
