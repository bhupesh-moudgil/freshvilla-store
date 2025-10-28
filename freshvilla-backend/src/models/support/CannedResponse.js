const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CannedResponse = sequelize.define('CannedResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Shortcode & Title
  shortCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Quick access code (e.g., /greeting)',
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  
  // Content
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Template content with variable placeholders',
  },
  
  // Categorization
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  // Scope & Visibility
  scope: {
    type: DataTypes.ENUM('global', 'team', 'personal'),
    defaultValue: 'personal',
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Team ID if scope is team',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  
  // Usage Tracking
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  
}, {
  tableName: 'canned_responses',
  timestamps: true,
  indexes: [
    { fields: ['shortCode'], unique: true },
    { fields: ['scope'] },
    { fields: ['createdBy'] },
    { fields: ['teamId'] },
    { fields: ['isActive'] },
    { fields: ['category'] },
  ],
});

// Instance method to increment usage
CannedResponse.prototype.recordUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

module.exports = CannedResponse;
