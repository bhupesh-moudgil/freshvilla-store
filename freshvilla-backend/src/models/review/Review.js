const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Product & Customer
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
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
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Link to verified purchase',
  },
  
  // Rating & Review
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Verification
  isVerifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Moderation
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'flagged'),
    defaultValue: 'pending',
  },
  moderatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  moderatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  moderationNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Media Attachments
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Review images URLs',
  },
  videos: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Review video URLs',
  },
  
  // Helpfulness
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  notHelpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Distributor Response
  distributorResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  distributorRespondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  distributorRespondedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'distributors',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional review metadata',
  },
  
  // Visibility
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  
  // Sentiment Analysis
  sentimentScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'AI-based sentiment score',
  },
  
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
    { fields: ['customerId'] },
    { fields: ['orderId'] },
    { fields: ['rating'] },
    { fields: ['status'] },
    { fields: ['isVerifiedPurchase'] },
    { fields: ['isVisible'] },
    { fields: ['createdAt'] },
    { fields: ['productId', 'status', 'isVisible'] },
  ],
});

// Instance method to check if review can be edited
Review.prototype.canEdit = function() {
  const hoursSinceCreation = (Date.now() - new Date(this.createdAt)) / (1000 * 60 * 60);
  return hoursSinceCreation < 48; // Editable within 48 hours
};

// Instance method to approve review
Review.prototype.approve = async function(moderatorId) {
  this.status = 'approved';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  await this.save();
};

module.exports = Review;
