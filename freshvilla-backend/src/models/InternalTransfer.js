const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InternalTransfer = sequelize.define('InternalTransfer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transferNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Auto-generated: IT-{FY}-{seq}',
  },
  financialYear: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'e.g., 2024-25',
  },
  
  // Transfer Type & Parties
  transferType: {
    type: DataTypes.ENUM(
      'warehouse_to_store',
      'store_to_warehouse',
      'store_to_store',
      'warehouse_to_warehouse'
    ),
    allowNull: false,
  },
  
  // Source
  sourceType: {
    type: DataTypes.ENUM('warehouse', 'store'),
    allowNull: false,
  },
  sourceId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'warehouseId or storeId',
  },
  sourceName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  sourceGSTIN: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  sourceAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sourceState: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  
  // Destination
  destinationType: {
    type: DataTypes.ENUM('warehouse', 'store'),
    allowNull: false,
  },
  destinationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  destinationName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  destinationGSTIN: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  destinationAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  destinationState: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  
  // Transfer Details
  transferDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  transferReason: {
    type: DataTypes.ENUM(
      'stock_replenishment',
      'return',
      'surplus',
      'emergency',
      'rebalancing',
      'damaged'
    ),
    defaultValue: 'stock_replenishment',
  },
  transferReasonDetails: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  transferStatus: {
    type: DataTypes.ENUM(
      'pending',
      'approved',
      'in_transit',
      'received',
      'cancelled',
      'rejected'
    ),
    defaultValue: 'pending',
    allowNull: false,
  },
  
  // Pricing Strategy
  pricingType: {
    type: DataTypes.ENUM('cost_price', 'market_price', 'transfer_price', 'zero_price'),
    defaultValue: 'transfer_price',
  },
  
  // Amounts
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  
  // GST Calculations
  isInterState: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  gstApplicable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  cgst: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  sgst: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  igst: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalTax: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  
  // E-Way Bill (Required for >₹50,000)
  eWayBillRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  eWayBillNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  eWayBillDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  eWayBillValidUpto: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  eWayBillStatus: {
    type: DataTypes.ENUM('not_required', 'generated', 'expired', 'cancelled'),
    defaultValue: 'not_required',
  },
  
  // Transport
  transportMode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'road, rail, air',
  },
  transporterName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  transporterGSTIN: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  vehicleNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  driverName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  driverPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  driverLicense: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  distance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Distance in KM',
  },
  estimatedDeliveryTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Hours',
  },
  
  // Invoice
  invoiceGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  invoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  invoicePath: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  invoiceUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  
  // Delivery
  expectedDelivery: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualDelivery: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  receivedBy: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  receivedByPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  receivedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Verification
  qualityCheckDone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  qualityCheckBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  qualityCheckAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  qualityCheckNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Discrepancies
  hasDiscrepancy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  discrepancyType: {
    type: DataTypes.ENUM('shortage', 'damage', 'quality_issue', 'extra'),
    allowNull: true,
  },
  discrepancyNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  discrepancyResolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Approval Workflow
  approvalRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  requestedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  requestedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Financial
  totalCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Actual cost',
  },
  transportCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  handlingCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  insuranceCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  otherCosts: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalTransferCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  
  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  internalRemarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'internal_transfers',
  timestamps: true,
  indexes: [
    { fields: ['transferNumber'], unique: true },
    { fields: ['transferType'] },
    { fields: ['transferStatus'] },
    { fields: ['sourceId'] },
    { fields: ['destinationId'] },
    { fields: ['financialYear'] },
    { fields: ['transferDate'] },
    { fields: ['approvalRequired'] },
    { fields: ['invoiceNumber'] },
  ],
});

module.exports = InternalTransfer;
