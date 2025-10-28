const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const City = sequelize.define('City', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'City name e.g., New Delhi, Mumbai',
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    comment: 'Unique city code e.g., DEL, MUM, BLR',
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'District name if applicable',
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'State name e.g., Delhi, Maharashtra',
  },
  stateCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'State code e.g., DL, MH, KA',
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'India',
  },
  
  // Service Configuration
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'City is active in system',
  },
  isServiceable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Can we deliver to this city?',
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Service priority (lower = higher priority)',
  },
  
  // Geography
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  
  // Additional Data
  population: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'City population for analytics',
  },
  tier: {
    type: DataTypes.ENUM('tier1', 'tier2', 'tier3', 'other'),
    defaultValue: 'other',
    comment: 'City tier classification',
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional city information',
  },
  
  // Statistics
  storesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of stores in this city',
  },
  customersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of customers in this city',
  },
  
  activatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When city service was activated',
  },
}, {
  tableName: 'cities',
  timestamps: true,
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['name'] },
    { fields: ['state'] },
    { fields: ['stateCode'] },
    { fields: ['isActive'] },
    { fields: ['isServiceable'] },
    { fields: ['priority'] },
    { fields: ['state', 'isActive'] },
  ],
});

// Instance method to check if serviceable
City.prototype.canDeliver = function() {
  return this.isActive && this.isServiceable;
};

// Instance method to get full display name
City.prototype.getFullName = function() {
  return `${this.name}, ${this.state}`;
};

module.exports = City;
