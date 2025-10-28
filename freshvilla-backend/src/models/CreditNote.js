const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CreditNote = sequelize.define('CreditNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  creditNoteNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'CN-{FY}-{seq}',
  },
  financialYear: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  creditNoteDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  
  // Original Invoice Reference
  originalInvoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'internal_invoices',
      key: 'id',
    },
  },
  originalInvoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  originalInvoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  
  // Parties
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
  
  // Reason
  creditNoteType: {
    type: DataTypes.ENUM(
      'full_cancellation',
      'partial_return',
      'price_adjustment',
      'discount_adjustment',
      'damaged_goods',
      'quality_issue',
      'other'
    ),
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  
  // Amounts
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
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
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  
  // Items (if partial)
  items: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of items being credited',
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('draft', 'issued', 'cancelled'),
    defaultValue: 'draft',
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Refund
  refundStatus: {
    type: DataTypes.ENUM('pending', 'processed', 'not_applicable'),
    defaultValue: 'pending',
  },
  refundAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  refundMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refundReference: {
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
  
  // GST Filing
  gstr1Filed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  gstr1FiledDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  
  // Approval
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  approvedAt: {
    type: DataTypes.DATE,
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
  tableName: 'credit_notes',
  timestamps: true,
  indexes: [
    { fields: ['creditNoteNumber'], unique: true },
    { fields: ['originalInvoiceId'] },
    { fields: ['financialYear'] },
    { fields: ['issuerId'] },
    { fields: ['recipientId'] },
    { fields: ['status'] },
    { fields: ['creditNoteDate'] },
  ],
});

module.exports = CreditNote;
