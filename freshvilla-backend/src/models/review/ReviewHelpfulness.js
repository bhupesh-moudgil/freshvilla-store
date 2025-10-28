const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ReviewHelpfulness = sequelize.define('ReviewHelpfulness', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  reviewId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'reviews',
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
  
  isHelpful: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    comment: 'true = helpful, false = not helpful',
  },
  
}, {
  tableName: 'review_helpfulness',
  timestamps: true,
  indexes: [
    { fields: ['reviewId', 'customerId'], unique: true },
    { fields: ['reviewId'] },
    { fields: ['customerId'] },
  ],
});

module.exports = ReviewHelpfulness;
