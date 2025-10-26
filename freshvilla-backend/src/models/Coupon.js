const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Please provide coupon code' },
      len: {
        args: [1, 20],
        msg: 'Coupon code cannot exceed 20 characters'
      }
    },
    set(value) {
      this.setDataValue('code', value.toUpperCase().trim());
    }
  },
  description: {
    type: DataTypes.STRING(500),
    validate: {
      len: {
        args: [0, 500],
        msg: 'Description cannot exceed 500 characters'
      }
    }
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please specify discount type' }
    }
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Discount value cannot be negative' }
    }
  },
  minOrderValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Minimum order value cannot be negative' }
    }
  },
  maxDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  validFrom: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide expiry date' }
    }
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  applicableCategories: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  excludedProducts: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'coupons',
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['isActive'] },
    { fields: ['validUntil'] }
  ]
});

// Instance methods
Coupon.prototype.isValid = function() {
  const now = new Date();
  
  if (!this.isActive) return false;
  if (this.validUntil < now || this.validFrom > now) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  
  return true;
};

Coupon.prototype.calculateDiscount = function(orderTotal) {
  if (!this.isValid()) return 0;
  if (orderTotal < this.minOrderValue) return 0;
  
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderTotal * this.discountValue) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }
  
  return Math.min(discount, orderTotal);
};

module.exports = Coupon;
