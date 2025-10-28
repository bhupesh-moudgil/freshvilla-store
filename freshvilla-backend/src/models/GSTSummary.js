const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GSTSummary = sequelize.define('GSTSummary', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Period
  financialYear: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 12 },
  },
  taxPeriod: {
    type: DataTypes.STRING(7),
    allowNull: false,
    unique: 'entity_period',
    comment: 'MMYYYY format',
  },
  
  // Entity
  entityType: {
    type: DataTypes.ENUM('warehouse', 'store', 'master'),
    allowNull: false,
    unique: 'entity_period',
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
    unique: 'entity_period',
  },
  entityName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  gstin: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  
  // Sales/Output Summary
  totalSalesValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  taxableSalesValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  outputCGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  outputSGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  outputIGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalOutputGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Purchase/Input Summary
  totalPurchaseValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  taxablePurchaseValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  inputCGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  inputSGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  inputIGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalInputGST: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // ITC
  itcAvailable: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  itcReversed: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  itcUtilized: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  itcBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Net Liability
  netGSTLiability: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // HSN Summary
  hsnSummary: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of HSN-wise summary',
  },
  
  // Transaction Counts
  totalInvoices: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalCreditNotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalDebitNotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // GSTR Filing Status
  gstr1Status: {
    type: DataTypes.ENUM('pending', 'filed', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
  gstr1FiledDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gstr1ARN: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Application Reference Number',
  },
  
  gstr3bStatus: {
    type: DataTypes.ENUM('pending', 'filed', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
  gstr3bFiledDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gstr3bARN: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  
  // Payment
  gstPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  challanNumber: {
    type: DataTypes.STRING(50),
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
  discrepancyNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'gst_summary',
  timestamps: true,
  indexes: [
    { fields: ['taxPeriod'] },
    { fields: ['financialYear'] },
    { fields: ['entityId'] },
    { fields: ['gstin'] },
    { unique: true, fields: ['taxPeriod', 'entityType', 'entityId'], name: 'entity_period' },
  ],
});

module.exports = GSTSummary;
