const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide name' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email' }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6, 100],
        msg: 'Password must be at least 6 characters'
      }
    }
  },
  mobile: {
    type: DataTypes.STRING
  },
  addresses: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Primary Location (extracted from addresses for querying)
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Primary city for filtering and service area matching',
  },
  cityCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'City code e.g., DEL, MUM, BLR',
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  stateCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'State code e.g., DL, MH, KA',
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  
  // Store Preference
  preferredStoreId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'stores',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Customer\'s preferred/favorite store',
  },
  lastOrderCity: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'City of last order placed',
  },
  lastOrderDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  accountLockedUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailOtp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailOtpExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailOtpVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  suspiciousLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Tracks failed login attempts before successful login'
  },
  mobileVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether mobile number is verified via WhatsApp link'
  },
  mobileVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Token for mobile verification link'
  },
  mobileVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Expiry time for mobile verification token (24 hours)'
  },
  mobileVerificationSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time verification message was sent (for rate limiting)'
  },
  mobileVerificationAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of verification attempts (max 3 per day)'
  }
}, {
  timestamps: true,
  tableName: 'customers',
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    }
  },
  hooks: {
    beforeCreate: async (customer) => {
      if (customer.password) {
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(customer.password, salt);
      }
    },
    beforeUpdate: async (customer) => {
      if (customer.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(customer.password, salt);
      }
    }
  }
});

// Instance method to compare password
Customer.prototype.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = Customer;
