const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InternalInvoice = sequelize.define('InternalInvoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'INV-INT-{FY}-{source}-{seq}',
  },
  invoiceType: {
    type: DataTypes.ENUM('internal_transfer', 'internal_sale', 'inter_branch', 'stock_adjustment'),
    defaultValue: 'internal_transfer',
  },
  financialYear: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  transferId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'internal_transfers', key: 'id' },
  },
  referenceNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  
  // Issuer (Seller/Supplier)
  issuerType: {
    type: DataTypes.ENUM('warehouse', 'store'),
    allowNull: false,
  },
  issuerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  issuerName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  issuerGSTIN: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  issuerAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  issuerCity: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  issuerState: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  issuerStateCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  
  // Recipient (Buyer)
  recipientType: {
    type: DataTypes.ENUM('warehouse', 'store'),
    allowNull: false,
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  recipientName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  recipientGSTIN: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  recipientAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recipientCity: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  recipientState: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  recipientStateCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  
  // Amounts
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed', 'none'),
    defaultValue: 'none',
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  taxableAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  
  // GST
  isInterState: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  
  // Additional Charges
  transportCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  handlingCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  packagingCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  insuranceCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  otherCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  totalAdditionalCharges: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  
  // Total
  roundOff: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  
  // Payment
  paymentStatus: {
    type: DataTypes.ENUM('not_applicable', 'pending', 'partial', 'paid'),
    defaultValue: 'not_applicable',
  },
  paymentMethod: {
    type: DataTypes.ENUM('internal_accounting', 'inter_branch_transfer'),
    allowNull: true,
  },
  paymentDueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  paidAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  paymentReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Documents
  pdfPath: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  eWayBillNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  eWayBillDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  eWayBillPath: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('draft', 'issued', 'cancelled', 'revised'),
    defaultValue: 'draft',
  },
  isRevised: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  originalInvoiceId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  revisionNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  revisionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Cancellation
  isCancelled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  creditNoteIssued: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  creditNoteNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  
  // Email
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailSentTo: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  emailSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Approval
  approvalRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // GST Filing
  gstr1Filed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  gstr1FiledDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  
  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'internal_invoices',
  timestamps: true,
  indexes: [
    { fields: ['invoiceNumber'], unique: true },
    { fields: ['transferId'] },
    { fields: ['financialYear'] },
    { fields: ['issuerId'] },
    { fields: ['recipientId'] },
    { fields: ['status'] },
    { fields: ['invoiceDate'] },
  ],
});

module.exports = InternalInvoice;
