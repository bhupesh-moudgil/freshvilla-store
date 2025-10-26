const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide product name' },
      len: {
        args: [1, 200],
        msg: 'Product name cannot exceed 200 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide product description' },
      len: {
        args: [1, 2000],
        msg: 'Description cannot exceed 2000 characters'
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Price cannot be negative'
      }
    }
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Discount cannot be negative' },
      max: { args: [100], msg: 'Discount cannot exceed 100%' }
    }
  },
  category: {
    type: DataTypes.ENUM(
      'Groceries',
      'Fruits & Vegetables',
      'Dairy & Eggs',
      'Snacks & Beverages',
      'Bakery',
      'Personal Care',
      'Household',
      'Others'
    ),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please select product category' }
    }
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: '/images/product-default.jpg'
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: '1 pc'
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Rating cannot be less than 0' },
      max: { args: [5], msg: 'Rating cannot be more than 5' }
    }
  },
  reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Stock cannot be negative' }
    }
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'products',
  indexes: [
    { fields: ['category'] },
    { fields: ['featured'] },
    { fields: ['isActive'] },
    { fields: ['name'] } // Regular B-tree index instead of GIN
  ]
});

// Virtual for calculating discount percentage
Product.prototype.getDiscountPercentage = function() {
  if (this.originalPrice > 0) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
};

module.exports = Product;
