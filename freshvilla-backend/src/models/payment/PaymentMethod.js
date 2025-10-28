const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PaymentMethod = sequelize.define('PaymentMethod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  
  // Payment Type
  type: {
    type: DataTypes.ENUM('card', 'upi', 'netbanking', 'wallet', 'cod'),
    allowNull: false,
  },
  
  // Card Details (tokenized)
  cardLast4: {
    type: DataTypes.STRING(4),
    allowNull: true,
  },
  cardBrand: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Visa, Mastercard, Amex, etc.',
  },
  cardExpiryMonth: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cardExpiryYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  
  // UPI Details
  upiId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Wallet Details
  walletProvider: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Paytm, PhonePe, GooglePay, etc.',
  },
  walletLinkedPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  
  // Bank Details (for netbanking)
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  bankCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  
  // Gateway Token
  gatewayToken: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Payment gateway tokenized reference',
  },
  gatewayProvider: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Razorpay, Stripe, PayU, etc.',
  },
  
  // Nickname
  nickname: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Default Payment
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  
  // Last Used
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
}, {
  tableName: 'payment_methods',
  timestamps: true,
  indexes: [
    { fields: ['customerId'] },
    { fields: ['type'] },
    { fields: ['isDefault'] },
    { fields: ['isActive'] },
    { fields: ['gatewayToken'] },
  ],
});

// Instance method to check if expired (for cards)
PaymentMethod.prototype.isExpired = function() {
  if (this.type !== 'card' || !this.cardExpiryMonth || !this.cardExpiryYear) {
    return false;
  }
  const now = new Date();
  const expiryDate = new Date(this.cardExpiryYear, this.cardExpiryMonth - 1);
  return now > expiryDate;
};

module.exports = PaymentMethod;
