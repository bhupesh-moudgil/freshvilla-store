const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide banner title' }
    }
  },
  subtitle: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide banner image' }
    }
  },
  imageAlt: {
    type: DataTypes.STRING,
    defaultValue: 'Banner Image'
  },
  type: {
    type: DataTypes.ENUM(
      'hero-slider',      // Main homepage slider
      'promotional',      // Promotional banners
      'category',         // Category banners
      'seasonal',         // Seasonal offers
      'popup'            // Popup banners
    ),
    allowNull: false,
    defaultValue: 'hero-slider'
  },
  linkUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL to navigate when banner is clicked'
  },
  linkText: {
    type: DataTypes.STRING,
    defaultValue: 'Shop Now'
  },
  buttonColor: {
    type: DataTypes.STRING,
    defaultValue: '#28a745',
    comment: 'Button background color (hex code)'
  },
  textColor: {
    type: DataTypes.STRING,
    defaultValue: '#ffffff',
    comment: 'Button text color (hex code)'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Banner start date (for scheduled campaigns)'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Banner end date (for seasonal offers)'
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Display order (lower numbers show first)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'banners',
  indexes: [
    { fields: ['type'] },
    { fields: ['isActive'] },
    { fields: ['position'] },
    { fields: ['startDate', 'endDate'] }
  ]
});

// Check if banner is currently active based on dates
Banner.prototype.isCurrentlyActive = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  return true;
};

module.exports = Banner;
