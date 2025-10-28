const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const StoreUser = sequelize.define('StoreUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id',
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'agent'),
    allowNull: false,
    defaultValue: 'agent',
    comment: 'owner: Full access, admin: Product/discount management, agent: Order management & printing',
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Custom permissions override for granular control',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
  lastLogin: {
    type: DataTypes.DATE,
  },
  invitedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'store_users',
      key: 'id',
    },
  },
  invitedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  acceptedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'store_users',
  timestamps: true,
  indexes: [
    { fields: ['storeId'] },
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['status'] },
  ],
});

// Hash password before saving
StoreUser.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

StoreUser.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// Instance method to compare password
StoreUser.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get role permissions
StoreUser.prototype.getPermissions = function() {
  const basePermissions = {
    owner: {
      // Full store access
      users: { view: true, create: true, edit: true, delete: true },
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true, delete: true, print: true },
      inventory: { view: true, adjust: true },
      financials: { view: true },
      discounts: { view: true, create: true, edit: true, delete: true },
      coupons: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, edit: true },
      reports: { view: true, export: true },
    },
    admin: {
      // Product and promotion management
      users: { view: true },
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, edit: true, print: true },
      inventory: { view: true, adjust: true },
      financials: { view: true },
      discounts: { view: true, create: true, edit: true, delete: true },
      coupons: { view: true, create: true, edit: true, delete: true },
      settings: { view: true },
      reports: { view: true, export: true },
    },
    agent: {
      // Order processing only
      users: { view: false },
      products: { view: true },
      orders: { view: true, edit: true, print: true },
      inventory: { view: true },
      financials: { view: false },
      discounts: { view: true },
      coupons: { view: true },
      settings: { view: false },
      reports: { view: false },
    },
  };

  // Merge base permissions with custom overrides
  const base = basePermissions[this.role] || basePermissions.agent;
  return { ...base, ...this.permissions };
};

// Check if user has specific permission
StoreUser.prototype.can = function(resource, action) {
  const permissions = this.getPermissions();
  return permissions[resource]?.[action] === true;
};

module.exports = StoreUser;
