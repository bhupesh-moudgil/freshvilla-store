const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GSTLedger = sequelize.define('GSTLedger', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Financial Period
  financialYear: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'e.g., 2024-25',
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  taxPeriod: {
    type: DataTypes.STRING(7),
    allowNull: false,
    comment: 'MMYYYY format',
  },
  
  // Entity
  entityType: {
    type: DataTypes.ENUM('warehouse', 'store', 'master'),
    allowNull: false,
    comment: 'master is for consolidated entries',
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Null for master entries',
  },
  entityName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  gstin: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  stateCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  
  // Transaction Details
  transactionType: {
    type: DataTypes.ENUM(
      'sale',
      'purchase',
      'internal_transfer',
      'credit_note',
      'debit_note',
      'adjustment'
    ),
    allowNull: false,
  },
  transactionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  
  // Reference Document
  referenceType: {
    type: DataTypes.ENUM(
      'internal_invoice',
      'customer_invoice',
      'purchase_invoice',
      'credit_note',
      'debit_note'
    ),
    allowNull: false,
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  referenceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  
  // Counter Party
  counterPartyType: {
    type: DataTypes.ENUM('warehouse', 'store', 'customer', 'supplier'),
    allowNull: false,
  },
  counterPartyName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  counterPartyGSTIN: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  counterPartyState: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  
  // Transaction Nature
  isInterState: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isReverseCharge: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  supplyType: {
    type: DataTypes.ENUM('goods', 'services'),
    defaultValue: 'goods',
  },
  
  // Amounts
  taxableAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  
  // Input GST (Purchase/Expense)
  inputCGST: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  inputSGST: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  inputIGST: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalInputGST: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  
  // Output GST (Sale/Revenue)
  outputCGST: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  outputSGST: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  outputIGST: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalOutputGST: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  
  // Total GST
  totalGST: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  
  // ITC (Input Tax Credit)
  itcEligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  itcClaimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  itcClaimedAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  itcClaimedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  
  // HSN/SAC Summary
  hsnCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  
  // GSTR Filing
  gstr1Status: {
    type: DataTypes.ENUM('pending', 'filed', 'not_applicable'),
    defaultValue: 'pending',
  },
  gstr1FiledDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gstr3bStatus: {
    type: DataTypes.ENUM('pending', 'filed', 'not_applicable'),
    defaultValue: 'pending',
  },
  gstr3bFiledDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  
  // Reconciliation
  isReconciled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reconciledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reconciliationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Amendments
  isAmended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  originalEntryId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  amendmentReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'gst_ledger',
  timestamps: true,
  indexes: [
    { fields: ['financialYear'] },
    { fields: ['taxPeriod'] },
    { fields: ['month'] },
    { fields: ['entityId'] },
    { fields: ['gstin'] },
    { fields: ['transactionType'] },
    { fields: ['transactionDate'] },
    { fields: ['referenceType', 'referenceId'] },
    { fields: ['gstr1Status'] },
    { fields: ['gstr3bStatus'] },
    { fields: ['isReconciled'] },
    { fields: ['hsnCode'] },
  ],
});

// Instance method to check if entry needs filing
GSTLedger.prototype.needsFiling = function() {
  return this.gstr1Status === 'pending' || this.gstr3bStatus === 'pending';
};

// Static method to get period summary
GSTLedger.getSummaryByPeriod = async function(taxPeriod, entityId = null) {
  const where = { taxPeriod };
  if (entityId) where.entityId = entityId;
  
  const entries = await this.findAll({ where });
  
  const summary = {
    totalInputGST: 0,
    totalOutputGST: 0,
    netGST: 0,
    itcAvailable: 0,
  };
  
  entries.forEach(entry => {
    summary.totalInputGST += parseFloat(entry.totalInputGST || 0);
    summary.totalOutputGST += parseFloat(entry.totalOutputGST || 0);
    if (entry.itcEligible) {
      summary.itcAvailable += parseFloat(entry.totalInputGST || 0);
    }
  });
  
  summary.netGST = summary.totalOutputGST - summary.itcAvailable;
  
  return summary;
};

module.exports = GSTLedger;
