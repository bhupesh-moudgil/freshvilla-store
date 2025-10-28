const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceArea = sequelize.define('ServiceArea', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id',
    },
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  areaName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true,
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
  // Delivery settings
  deliveryTime: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: 'Estimated delivery time in minutes',
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  minimumOrder: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  // Priority system
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Higher priority areas get orders first (1 = highest)',
  },
  // Service windows
  serviceHours: {
    type: DataTypes.JSONB,
    defaultValue: {
      monday: { open: '09:00', close: '21:00', isOpen: true },
      tuesday: { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday: { open: '09:00', close: '21:00', isOpen: true },
      friday: { open: '09:00', close: '21:00', isOpen: true },
      saturday: { open: '09:00', close: '22:00', isOpen: true },
      sunday: { open: '10:00', close: '20:00', isOpen: true },
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'service_areas',
  timestamps: true,
  indexes: [
    { fields: ['storeId'] },
    { fields: ['city'] },
    { fields: ['pincode'] },
    { fields: ['isActive'] },
    { fields: ['storeId', 'city', 'areaName'] },
  ],
});

// Instance method to check if currently open
ServiceArea.prototype.isCurrentlyOpen = function() {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  const todayHours = this.serviceHours[dayName];
  if (!todayHours || !todayHours.isOpen) {
    return false;
  }

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

module.exports = ServiceArea;
