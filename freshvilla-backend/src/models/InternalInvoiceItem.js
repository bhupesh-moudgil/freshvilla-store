const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InternalInvoiceItem = sequelize.define('InternalInvoiceItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'internal_invoices',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  transferItemId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'internal_transfer_items',
      key: 'id',
    },
    comment: 'Link to transfer item if invoice is for a transfer',
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
  
  // Product Info (Denormalized)
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
    allowNull: false,
    comment: 'HSN/SAC code for GST compliance',
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Quantities
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0.01], msg: 'Quantity must be positive' },
    },
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: 'piece',
    comment: 'kg, piece, liter, box, etc.',
  },
  
  // Pricing
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Unit price cannot be negative' },
    },
  },
  discountPercent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Discount cannot be negative' },
      max: { args: [100], msg: 'Discount cannot exceed 100%' },
    },
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  
  // Amounts
  itemSubtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'quantity * unitPrice',
  },
  taxableAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'itemSubtotal - discountAmount',
  },
  
  // GST
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'GST rate: 0, 5, 12, 18, 28',
    validate: {
      isIn: {
        args: [[0, 5, 12, 18, 28]],
        msg: 'Tax rate must be 0, 5, 12, 18, or 28',
      },
    },
  },
  cgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  sgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  igstRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  cgstAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  sgstAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  igstAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalTaxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  itemTotalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'taxableAmount + totalTaxAmount',
  },
  
  // Batch/Serial Tracking
  batchNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  serialNumber: {
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
  
  // Additional Details
  warrantyPeriod: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Warranty in days',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Sequence in invoice
  lineNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Line item sequence in invoice',
  },
}, {
  tableName: 'internal_invoice_items',
  timestamps: true,
  indexes: [
    { fields: ['invoiceId'] },
    { fields: ['productId'] },
    { fields: ['transferItemId'] },
    { fields: ['hsnCode'] },
    { fields: ['batchNumber'] },
  ],
  hooks: {
    beforeValidate: (item) => {
      // Calculate subtotal
      item.itemSubtotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
      
      // Calculate discount
      if (item.discountPercent > 0) {
        item.discountAmount = (item.itemSubtotal * item.discountPercent) / 100;
      }
      
      // Calculate taxable amount
      item.taxableAmount = item.itemSubtotal - item.discountAmount;
      
      // Calculate GST rates (split equally for intra-state)
      if (item.igstRate > 0) {
        item.cgstRate = 0;
        item.sgstRate = 0;
      } else {
        item.cgstRate = item.taxRate / 2;
        item.sgstRate = item.taxRate / 2;
        item.igstRate = 0;
      }
      
      // Calculate tax amounts
      item.cgstAmount = (item.taxableAmount * item.cgstRate) / 100;
      item.sgstAmount = (item.taxableAmount * item.sgstRate) / 100;
      item.igstAmount = (item.taxableAmount * item.igstRate) / 100;
      item.totalTaxAmount = item.cgstAmount + item.sgstAmount + item.igstAmount;
      
      // Calculate total
      item.itemTotalAmount = item.taxableAmount + item.totalTaxAmount;
    },
  },
});

// Instance method to get GST breakdown
InternalInvoiceItem.prototype.getGSTBreakdown = function() {
  return {
    hsnCode: this.hsnCode,
    taxableAmount: parseFloat(this.taxableAmount),
    taxRate: parseFloat(this.taxRate),
    cgst: {
      rate: parseFloat(this.cgstRate),
      amount: parseFloat(this.cgstAmount),
    },
    sgst: {
      rate: parseFloat(this.sgstRate),
      amount: parseFloat(this.sgstAmount),
    },
    igst: {
      rate: parseFloat(this.igstRate),
      amount: parseFloat(this.igstAmount),
    },
    totalTax: parseFloat(this.totalTaxAmount),
  };
};

module.exports = InternalInvoiceItem;
