const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  cartId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'carts',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  
  // Variant (if applicable)
  variantId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Product variant ID',
  },
  
  // Quantity
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },
  
  // Pricing Snapshot
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price per unit at time of add',
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total price (quantity * unitPrice)',
  },
  
  // Discount
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed', 'none'),
    defaultValue: 'none',
  },
  
  // Product Snapshot (to preserve data if product changes)
  productSnapshot: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Snapshot of product details at time of add',
  },
  
  // Distributor Info
  distributorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'distributors',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  
  // Special Instructions
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  
  // Availability Check
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  availabilityMessage: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  
}, {
  tableName: 'cart_items',
  timestamps: true,
  indexes: [
    { fields: ['cartId'] },
    { fields: ['productId'] },
    { fields: ['distributorId'] },
    { fields: ['cartId', 'productId', 'variantId'], unique: true },
  ],
});

// Instance method to calculate total
CartItem.prototype.calculateTotal = function() {
  const subtotal = this.quantity * parseFloat(this.unitPrice);
  const discount = parseFloat(this.discountAmount) || 0;
  return subtotal - discount;
};

// Instance method to update total price
CartItem.prototype.updateTotalPrice = async function() {
  this.totalPrice = this.calculateTotal();
  await this.save();
};

module.exports = CartItem;
