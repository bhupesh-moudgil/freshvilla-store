const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Conversation Link
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'conversations',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  
  // Message Content
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contentType: {
    type: DataTypes.ENUM('text', 'html', 'markdown'),
    defaultValue: 'text',
  },
  
  // Sender Information
  senderType: {
    type: DataTypes.ENUM('customer', 'agent', 'bot', 'system'),
    allowNull: false,
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of customer, employee, or bot',
  },
  senderName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  
  // Message Type
  messageType: {
    type: DataTypes.ENUM('incoming', 'outgoing', 'activity', 'private_note'),
    allowNull: false,
    defaultValue: 'outgoing',
  },
  
  // Attachments
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of attachment objects with url, type, size, name',
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
    defaultValue: 'sent',
  },
  
  // External Integration
  externalId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'External message ID from channel',
  },
  sourceId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Original message ID for replies',
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional message metadata',
  },
  
  // Reactions & Engagement
  reactions: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Message reactions/emojis',
  },
  
  // Sentiment Analysis
  sentimentScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'AI-based sentiment score',
  },
  
  // Read Status
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Bot/Automation
  isAutomated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    { fields: ['conversationId'] },
    { fields: ['senderType', 'senderId'] },
    { fields: ['messageType'] },
    { fields: ['status'] },
    { fields: ['createdAt'] },
    { fields: ['conversationId', 'createdAt'] },
  ],
});

// Instance method to check if message is from customer
Message.prototype.isFromCustomer = function() {
  return this.senderType === 'customer';
};

// Instance method to mark as read
Message.prototype.markAsRead = async function() {
  if (!this.readAt) {
    this.readAt = new Date();
    this.status = 'read';
    await this.save();
  }
};

module.exports = Message;
