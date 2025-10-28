const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Employee ID e.g., EMP-001, DEL-001',
  },
  
  // Personal Information
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  alternateMobile: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  
  // Password for app/portal login
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'For employees with system access',
  },
  
  // Employee Type
  employeeType: {
    type: DataTypes.ENUM(
      'warehouse_staff',
      'warehouse_manager',
      'delivery_personnel',
      'store_staff',
      'store_manager',
      'supervisor',
      'operations'
    ),
    allowNull: false,
    comment: 'Role/type of employee',
  },
  
  // Workplace Assignment
  warehouseId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'warehouses',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Assigned warehouse',
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
    comment: 'Assigned store',
  },
  
  // Location (for filtering and assignment)
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  cityCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  stateCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  
  // Address
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  
  // Employment Details
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  relievingDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_leave', 'terminated'),
    defaultValue: 'active',
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Department e.g., Logistics, Warehouse, Delivery',
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Reporting
  reportingTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Supervisor/Manager',
  },
  
  // Salary & Compensation
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monthly salary',
  },
  salaryType: {
    type: DataTypes.ENUM('monthly', 'daily', 'hourly', 'contract'),
    defaultValue: 'monthly',
  },
  
  // Documents
  aadhaarNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  panNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  drivingLicense: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'For delivery personnel',
  },
  
  // Access & Permissions
  hasSystemAccess: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Can login to system',
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  // Performance
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 5,
    },
  },
  completedTasks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Emergency contact details',
  },
}, {
  tableName: 'employees',
  timestamps: true,
  indexes: [
    { fields: ['employeeId'], unique: true },
    { fields: ['email'], unique: true, where: { email: { [sequelize.Sequelize.Op.ne]: null } } },
    { fields: ['mobile'] },
    { fields: ['employeeType'] },
    { fields: ['status'] },
    { fields: ['warehouseId'] },
    { fields: ['storeId'] },
    { fields: ['city'] },
    { fields: ['cityCode'] },
    { fields: ['reportingTo'] },
    { fields: ['employeeType', 'status'] },
    { fields: ['city', 'employeeType'] },
  ],
  hooks: {
    beforeCreate: async (employee) => {
      if (employee.password) {
        const salt = await bcrypt.genSalt(10);
        employee.password = await bcrypt.hash(employee.password, salt);
      }
    },
    beforeUpdate: async (employee) => {
      if (employee.changed('password') && employee.password) {
        const salt = await bcrypt.genSalt(10);
        employee.password = await bcrypt.hash(employee.password, salt);
      }
    },
  },
});

// Instance method to compare password
Employee.prototype.comparePassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to get full name
Employee.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Instance method to check if active
Employee.prototype.isActive = function() {
  return this.status === 'active';
};

module.exports = Employee;
