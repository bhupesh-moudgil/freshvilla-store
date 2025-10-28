const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Store Financial Transactions
const StoreTransaction = sequelize.define('StoreTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id',
    },
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  transactionType: {
    type: DataTypes.ENUM('sale', 'expense', 'commission', 'refund', 'adjustment'),
    allowNull: false,
  },
  // Amounts
  grossAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total sale amount',
  },
  platformCommission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Commission deducted by platform',
  },
  netAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Amount store receives (gross - commission)',
  },
  // Details
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'completed',
  },
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'store_transactions',
  timestamps: true,
  indexes: [
    { fields: ['storeId'] },
    { fields: ['orderId'] },
    { fields: ['transactionType'] },
    { fields: ['transactionDate'] },
    { fields: ['status'] },
  ],
});

// Store Inventory Ledger
const InventoryLedger = sequelize.define('InventoryLedger', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  // Stock Movement
  movementType: {
    type: DataTypes.ENUM('purchase', 'sale', 'return', 'adjustment', 'damage', 'transfer'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Positive for stock-in, negative for stock-out',
  },
  previousStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  newStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Financial
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Cost per unit for this transaction',
  },
  totalValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Total value of this stock movement',
  },
  // Reference
  referenceType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'order, purchase, adjustment',
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of the related order/purchase/etc',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Admin/Store manager who made this entry',
  },
}, {
  tableName: 'inventory_ledger',
  timestamps: true,
  indexes: [
    { fields: ['storeId'] },
    { fields: ['productId'] },
    { fields: ['movementType'] },
    { fields: ['createdAt'] },
  ],
});

// Store Revenue Summary (aggregated daily)
const StoreRevenueSummary = sequelize.define('StoreRevenueSummary', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // Sales Metrics
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalItems: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  grossRevenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Total sales before commission',
  },
  platformCommission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  netRevenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Revenue after commission',
  },
  // Expenses
  totalExpenses: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  // Profit
  netProfit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Net revenue - expenses',
  },
  // Refunds
  totalRefunds: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
}, {
  tableName: 'store_revenue_summary',
  timestamps: true,
  indexes: [
    { fields: ['storeId'] },
    { fields: ['date'] },
    { 
      unique: true,
      fields: ['storeId', 'date'],
      name: 'unique_store_date'
    },
  ],
});

// Product Commission Settings
const ProductCommission = sequelize.define('ProductCommission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id',
    },
  },
  // Commission Structure
  commissionType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    defaultValue: 'percentage',
  },
  commissionValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Percentage (e.g., 15.00) or Fixed amount (e.g., 50.00)',
  },
  // Cost and Pricing
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Store purchase/cost price',
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Store selling price',
  },
  // Calculated Fields
  storeEarningPerUnit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'What store earns per unit after commission',
  },
  profitMargin: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Percentage profit margin',
  },
}, {
  tableName: 'product_commissions',
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
    { fields: ['storeId'] },
  ],
});

module.exports = {
  StoreTransaction,
  InventoryLedger,
  StoreRevenueSummary,
  ProductCommission,
};
