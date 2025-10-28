const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Inbox = sequelize.define('Inbox', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Basic Info
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Channel Configuration
  channelType: {
    type: DataTypes.ENUM('chat', 'email', 'whatsapp', 'phone', 'api'),
    allowNull: false,
  },
  
  // Channel-Specific Settings
  channelConfig: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Channel-specific configuration (SMTP, WhatsApp API, etc.)',
  },
  
  // Webhook Configuration
  webhookUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  
  // Assignment & Routing
  autoAssignment: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  assignmentStrategy: {
    type: DataTypes.ENUM('round_robin', 'load_balanced', 'priority', 'manual'),
    defaultValue: 'round_robin',
  },
  
  // Team Assignment
  teamIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'Teams with access to this inbox',
  },
  
  // Business Hours
  businessHours: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Working hours configuration',
  },
  
  // Auto-Reply Settings
  autoReplyEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  autoReplyMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  outOfOfficeMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // SLA Configuration
  slaConfig: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'SLA targets for first response, resolution time',
  },
  
  // Email Specific
  emailForwardingEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailForwardingAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  
  // Widget Settings (for chat)
  widgetConfig: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Chat widget appearance and behavior settings',
  },
  
  // CSAT & Feedback
  csatEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  csatSurveyMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Metrics
  totalConversations: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  averageResponseTime: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Average first response time in seconds',
  },
  
}, {
  tableName: 'inboxes',
  timestamps: true,
  indexes: [
    { fields: ['channelType'] },
    { fields: ['isActive'] },
    { fields: ['name'] },
  ],
});

// Instance method to check if inbox is available
Inbox.prototype.isAvailableNow = function() {
  if (!this.isActive) return false;
  // Add business hours check logic here if needed
  return true;
};

module.exports = Inbox;
