const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Recipient
  recipientType: {
    type: DataTypes.ENUM('customer', 'distributor', 'employee', 'admin'),
    allowNull: false,
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of customer, distributor, or employee',
  },
  
  // Notification Content
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'order_placed, payment_success, shipping_update, etc.',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  
  // Channel
  channel: {
    type: DataTypes.ENUM('in_app', 'email', 'sms', 'push', 'whatsapp'),
    allowNull: false,
    defaultValue: 'in_app',
  },
  
  // Priority
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'read'),
    defaultValue: 'pending',
  },
  
  // Delivery Tracking
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Action/Link
  actionUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Deep link or URL for notification action',
  },
  actionLabel: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Related Entity
  relatedEntityType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'order, product, conversation, etc.',
  },
  relatedEntityId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional notification data',
  },
  
  // Error Info
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Expiry
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Icon/Image
  iconUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['recipientType', 'recipientId'] },
    { fields: ['recipientId', 'status'] },
    { fields: ['type'] },
    { fields: ['channel'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['createdAt'] },
    { fields: ['readAt'] },
    { fields: ['relatedEntityType', 'relatedEntityId'] },
  ],
});

// Instance method to mark as read
Notification.prototype.markAsRead = async function() {
  if (!this.readAt) {
    this.readAt = new Date();
    this.status = 'read';
    await this.save();
  }
};

// Instance method to check if expired
Notification.prototype.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > new Date(this.expiresAt);
};

module.exports = Notification;
