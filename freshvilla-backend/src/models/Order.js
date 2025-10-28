const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  
  // Foreign Keys
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Link to customer account',
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'stores',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Store fulfilling this order',
  },
  
  // Customer details (denormalized for history)
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Customer name is required' }
    }
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: { msg: 'Please provide a valid email' },
      notEmpty: { msg: 'Customer email is required' }
    }
  },
  customerMobile: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Customer mobile is required' }
    }
  },
  customerAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Delivery address is required' }
    }
  },
  
  // Delivery Location (for querying and analytics)
  deliveryCity: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  deliveryCityCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  deliveryDistrict: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  deliveryState: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  deliveryStateCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  deliveryPincode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  couponCode: {
    type: DataTypes.STRING
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('COD', 'Online', 'Card'),
    defaultValue: 'COD'
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
    defaultValue: 'Pending'
  },
  orderStatus: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
    defaultValue: 'Pending'
  },
  notes: {
    type: DataTypes.TEXT
  },
  deliveryDate: {
    type: DataTypes.DATE
  },
  cancelReason: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'orders',
  indexes: [
    { fields: ['orderNumber'], unique: true },
    { fields: ['customerEmail'] },
    { fields: ['customerMobile'] },
    { fields: ['orderStatus'] },
    { fields: ['createdAt'] }
  ],
  hooks: {
    beforeValidate: async (order) => {
      if (!order.orderNumber) {
        const count = await Order.count();
        order.orderNumber = `FV${Date.now()}${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

module.exports = Order;
