const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WarehouseInventory = sequelize.define('WarehouseInventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  warehouseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'warehouses',
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
    onDelete: 'CASCADE',
  },
  
  // Product Info (denormalized for speed)
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
    comment: 'HSN code for GST',
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Stock Levels
  currentStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Stock cannot be negative' },
    },
  },
  minimumStock: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Minimum stock level before reorder alert',
  },
  maximumStock: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
    comment: 'Maximum stock capacity',
  },
  reorderPoint: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    comment: 'Stock level at which to trigger reorder',
  },
  
  // Pricing
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Purchase/cost price',
  },
  transferPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Internal transfer price to stores',
  },
  
  // Location in Warehouse
  rackNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  binLocation: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  aisle: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  
  // Batch Info
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
  
  // Stock Status
  availableStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Stock available for transfer (not reserved)',
  },
  reservedStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Stock reserved for pending transfers',
  },
  damagedStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Damaged/unusable stock',
  },
  
  // Tracking
  lastRestockedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastTransferredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'warehouse_inventory',
  timestamps: true,
  indexes: [
    { fields: ['warehouseId'] },
    { fields: ['productId'] },
    { fields: ['warehouseId', 'productId'], unique: true },
    { fields: ['currentStock'] },
    { fields: ['availableStock'] },
    { fields: ['expiryDate'] },
  ],
});

// Instance method to check if stock is low
WarehouseInventory.prototype.isStockLow = function() {
  return this.currentStock <= this.reorderPoint;
};

// Instance method to check if needs reorder
WarehouseInventory.prototype.needsReorder = function() {
  return this.currentStock < this.minimumStock;
};

// Instance method to reserve stock
WarehouseInventory.prototype.reserveStock = async function(quantity) {
  if (this.availableStock < quantity) {
    throw new Error('Insufficient available stock');
  }
  
  this.availableStock -= quantity;
  this.reservedStock += quantity;
  await this.save();
  
  return this;
};

// Instance method to release reserved stock
WarehouseInventory.prototype.releaseReservedStock = async function(quantity) {
  if (this.reservedStock < quantity) {
    throw new Error('Cannot release more than reserved stock');
  }
  
  this.reservedStock -= quantity;
  this.availableStock += quantity;
  await this.save();
  
  return this;
};

module.exports = WarehouseInventory;
