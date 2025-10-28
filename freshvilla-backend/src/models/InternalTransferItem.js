const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InternalTransferItem = sequelize.define('InternalTransferItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transferId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'internal_transfers',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  
  // Product Info
  productName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  productSKU: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  hsnCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Quantities
  requestedQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Requested quantity must be at least 1' },
    },
  },
  approvedQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shippedQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  receivedQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Discrepancies
  damagedQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shortageQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  excessQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rejectedQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Unit
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: 'piece',
    comment: 'kg, piece, liter, box, etc.',
  },
  
  // Pricing
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  marketPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  transferPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price used for this transfer',
  },
  
  // Amounts
  itemSubtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'GST rate: 0, 5, 12, 18, 28',
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  itemTotalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  
  // Batch Tracking
  batchNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  manufactureDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  shelfLife: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Days',
  },
  
  // Quality
  qualityGrade: {
    type: DataTypes.ENUM('A', 'B', 'C', 'rejected'),
    defaultValue: 'A',
  },
  qualityNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Storage Location (at source)
  sourceRackNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  sourceBinLocation: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  
  // Storage Location (at destination)
  destinationRackNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  destinationBinLocation: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
}, {
  tableName: 'internal_transfer_items',
  timestamps: true,
  indexes: [
    { fields: ['transferId'] },
    { fields: ['productId'] },
    { fields: ['batchNumber'] },
    { fields: ['expiryDate'] },
  ],
});

// Instance method to calculate discrepancy
InternalTransferItem.prototype.calculateDiscrepancy = function() {
  const expected = this.shippedQuantity || this.approvedQuantity;
  const actual = this.receivedQuantity;
  return actual - expected;
};

// Instance method to check if item has issues
InternalTransferItem.prototype.hasIssues = function() {
  return (
    this.damagedQuantity > 0 ||
    this.shortageQuantity > 0 ||
    this.rejectedQuantity > 0 ||
    this.qualityGrade === 'rejected'
  );
};

module.exports = InternalTransferItem;
