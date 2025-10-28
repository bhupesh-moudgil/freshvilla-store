const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique conversation identifier',
  },
  
  // Customer Link
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  
  // Channel Information
  channelType: {
    type: DataTypes.ENUM('chat', 'email', 'whatsapp', 'phone'),
    allowNull: false,
    defaultValue: 'chat',
  },
  inboxId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Link to Inbox configuration',
  },
  
  // Assignment
  assignedAgentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Assigned support agent',
  },
  assignedTeamId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Assigned support team',
  },
  
  // Status & Priority
  status: {
    type: DataTypes.ENUM('open', 'pending', 'resolved', 'closed'),
    defaultValue: 'open',
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  
  // Tags & Classification
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorization',
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Conversation category',
  },
  
  // Custom Attributes
  customAttributes: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional conversation metadata',
  },
  
  // SLA & Metrics
  firstResponseTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'First response time in seconds',
  },
  resolutionTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total resolution time in seconds',
  },
  slaBreached: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Activity Tracking
  lastActivityAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // External Reference
  externalId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'External system ID (e.g., WhatsApp conversation ID)',
  },
  
  // Contact Info (for quick access)
  contactName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  
  // Message Count
  messageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unreadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
}, {
  tableName: 'conversations',
  timestamps: true,
  indexes: [
    { fields: ['conversationId'], unique: true },
    { fields: ['customerId'] },
    { fields: ['assignedAgentId'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['channelType'] },
    { fields: ['lastActivityAt'] },
    { fields: ['status', 'assignedAgentId'] },
    { fields: ['channelType', 'status'] },
  ],
});

// Instance method to check if conversation is active
Conversation.prototype.isActive = function() {
  return this.status === 'open' || this.status === 'pending';
};

// Instance method to calculate response time
Conversation.prototype.calculateFirstResponse = function(responseDate) {
  if (!this.createdAt) return null;
  return Math.floor((new Date(responseDate) - new Date(this.createdAt)) / 1000);
};

module.exports = Conversation;
