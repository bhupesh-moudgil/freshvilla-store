const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Unique transaction identifier',
  },
  
  // Order Link
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
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
  
  // Transaction Details
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR',
  },
  
  // Transaction Type
  type: {
    type: DataTypes.ENUM('payment', 'refund', 'partial_refund', 'chargeback'),
    allowNull: false,
    defaultValue: 'payment',
  },
  
  // Payment Method
  paymentMethod: {
    type: DataTypes.ENUM('card', 'upi', 'netbanking', 'wallet', 'cod'),
    allowNull: false,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
  },
  
  // Gateway Information
  gatewayProvider: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Razorpay, Stripe, PayU, etc.',
  },
  gatewayTransactionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  gatewayOrderId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  
  // Gateway Response
  gatewayResponse: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Complete gateway response',
  },
  
  // Error Details
  errorCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Payment Details
  paymentDetails: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Card last4, UPI ID, bank name, etc.',
  },
  
  // Timestamps
  initiatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Refund Details (if applicable)
  refundedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // IP & Device
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
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
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    { fields: ['transactionId'], unique: true },
    { fields: ['orderId'] },
    { fields: ['customerId'] },
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['gatewayTransactionId'] },
    { fields: ['paymentMethod'] },
    { fields: ['initiatedAt'] },
    { fields: ['isReconciled'] },
  ],
});

// Instance method to check if transaction is successful
Transaction.prototype.isSuccessful = function() {
  return this.status === 'success';
};

// Instance method to mark as reconciled
Transaction.prototype.reconcile = async function() {
  this.isReconciled = true;
  this.reconciledAt = new Date();
  await this.save();
};

module.exports = Transaction;
