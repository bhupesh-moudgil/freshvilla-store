const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Warehouse = sequelize.define('Warehouse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  warehouseCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Unique warehouse code e.g., WHN-01, WHM-01',
  },
  warehouseName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Warehouse name is required' },
    },
  },
  warehouseType: {
    type: DataTypes.ENUM('main', 'regional', 'satellite'),
    defaultValue: 'regional',
    allowNull: false,
  },
  
  // Location
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  stateCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'State code e.g., DL, MH, KA',
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'India',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  
  // Legal Details
  gstNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      is: {
        args: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        msg: 'Invalid GST number format',
      },
    },
  },
  panNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  tanNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  
  // Contact
  managerName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  managerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  managerEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: { msg: 'Invalid email format' },
    },
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  contactEmail: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: { msg: 'Invalid email format' },
    },
  },
  
  // Capacity
  totalCapacitySqFt: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Total warehouse capacity in square feet',
  },
  usedCapacitySqFt: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  availableCapacitySqFt: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  totalStorageUnits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total pallets/racks/storage units',
  },
  
  // Operations
  operatingHours: {
    type: DataTypes.JSONB,
    defaultValue: {
      monday: '9:00-18:00',
      tuesday: '9:00-18:00',
      wednesday: '9:00-18:00',
      thursday: '9:00-18:00',
      friday: '9:00-18:00',
      saturday: '9:00-14:00',
      sunday: 'Closed',
    },
  },
  servingStates: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'State codes this warehouse serves',
  },
  servingCities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Cities this warehouse serves',
  },
  
  // Financial
  operationalCostPerMonth: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  electricityAccountNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    defaultValue: 'active',
    allowNull: false,
  },
  operationalSince: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  
  // Metadata
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Admin ID who created this warehouse',
  },
}, {
  tableName: 'warehouses',
  timestamps: true,
  indexes: [
    { fields: ['warehouseCode'], unique: true },
    { fields: ['gstNumber'], unique: true },
    { fields: ['status'] },
    { fields: ['warehouseType'] },
    { fields: ['state'] },
    { fields: ['city'] },
  ],
});

// Instance method to calculate available capacity
Warehouse.prototype.calculateAvailableCapacity = function() {
  return parseFloat(this.totalCapacitySqFt) - parseFloat(this.usedCapacitySqFt);
};

// Instance method to check if warehouse is operational
Warehouse.prototype.isOperational = function() {
  return this.status === 'active';
};

module.exports = Warehouse;
