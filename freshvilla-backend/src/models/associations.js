/**
 * Centralized Model Associations
 * Define all Sequelize relationships here for proper eager loading and queries
 */

const Store = require('./Store');
const Customer = require('./Customer');
const Order = require('./Order');
const City = require('./City');
const Employee = require('./Employee');
const Warehouse = require('./Warehouse');
const ServiceArea = require('./ServiceArea');
const StoreUser = require('./StoreUser');
const Product = require('./Product');
const InternalInvoice = require('./InternalInvoice');
const InternalInvoiceItem = require('./InternalInvoiceItem');
const InternalTransfer = require('./InternalTransfer');
const InternalTransferItem = require('./InternalTransferItem');
const WarehouseInventory = require('./WarehouseInventory');

/**
 * Define all associations
 */
function setupAssociations() {
  
  // ============================================
  // STORE RELATIONSHIPS
  // ============================================
  
  // Store hasMany Orders
  Store.hasMany(Order, {
    foreignKey: 'storeId',
    as: 'orders',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // Store hasMany ServiceAreas
  Store.hasMany(ServiceArea, {
    foreignKey: 'storeId',
    as: 'serviceAreas',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // Store hasMany StoreUsers
  Store.hasMany(StoreUser, {
    foreignKey: 'storeId',
    as: 'users',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // Store hasMany Employees
  Store.hasMany(Employee, {
    foreignKey: 'storeId',
    as: 'employees',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // ============================================
  // CUSTOMER RELATIONSHIPS
  // ============================================
  
  // Customer hasMany Orders
  Customer.hasMany(Order, {
    foreignKey: 'customerId',
    as: 'orders',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // Customer belongsTo Store (preferred store)
  Customer.belongsTo(Store, {
    foreignKey: 'preferredStoreId',
    as: 'preferredStore',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // ============================================
  // ORDER RELATIONSHIPS
  // ============================================
  
  // Order belongsTo Customer
  Order.belongsTo(Customer, {
    foreignKey: 'customerId',
    as: 'customer',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // Order belongsTo Store
  Order.belongsTo(Store, {
    foreignKey: 'storeId',
    as: 'store',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // ============================================
  // WAREHOUSE RELATIONSHIPS
  // ============================================
  
  // Warehouse hasMany Employees
  Warehouse.hasMany(Employee, {
    foreignKey: 'warehouseId',
    as: 'employees',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // Warehouse hasMany WarehouseInventory
  Warehouse.hasMany(WarehouseInventory, {
    foreignKey: 'warehouseId',
    as: 'inventory',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // Warehouse hasMany InternalTransfers (as source)
  Warehouse.hasMany(InternalTransfer, {
    foreignKey: 'sourceWarehouseId',
    as: 'transfersFrom',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  
  // Warehouse hasMany InternalTransfers (as destination)
  Warehouse.hasMany(InternalTransfer, {
    foreignKey: 'destinationWarehouseId',
    as: 'transfersTo',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  
  // ============================================
  // EMPLOYEE RELATIONSHIPS
  // ============================================
  
  // Employee belongsTo Warehouse
  Employee.belongsTo(Warehouse, {
    foreignKey: 'warehouseId',
    as: 'warehouse',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // Employee belongsTo Store
  Employee.belongsTo(Store, {
    foreignKey: 'storeId',
    as: 'store',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // Employee belongsTo Employee (supervisor)
  Employee.belongsTo(Employee, {
    foreignKey: 'reportingTo',
    as: 'supervisor',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // Employee hasMany Employees (subordinates)
  Employee.hasMany(Employee, {
    foreignKey: 'reportingTo',
    as: 'subordinates',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  
  // ============================================
  // SERVICE AREA RELATIONSHIPS
  // ============================================
  
  // ServiceArea belongsTo Store
  ServiceArea.belongsTo(Store, {
    foreignKey: 'storeId',
    as: 'store',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // ============================================
  // STORE USER RELATIONSHIPS
  // ============================================
  
  // StoreUser belongsTo Store
  StoreUser.belongsTo(Store, {
    foreignKey: 'storeId',
    as: 'store',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // ============================================
  // INTERNAL INVOICE RELATIONSHIPS
  // ============================================
  
  // InternalInvoice hasMany InternalInvoiceItems
  InternalInvoice.hasMany(InternalInvoiceItem, {
    foreignKey: 'invoiceId',
    as: 'items',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // InternalInvoiceItem belongsTo InternalInvoice
  InternalInvoiceItem.belongsTo(InternalInvoice, {
    foreignKey: 'invoiceId',
    as: 'invoice',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // InternalInvoiceItem belongsTo Product
  InternalInvoiceItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  
  // ============================================
  // INTERNAL TRANSFER RELATIONSHIPS
  // ============================================
  
  // InternalTransfer hasMany InternalTransferItems
  InternalTransfer.hasMany(InternalTransferItem, {
    foreignKey: 'transferId',
    as: 'items',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // InternalTransferItem belongsTo InternalTransfer
  InternalTransferItem.belongsTo(InternalTransfer, {
    foreignKey: 'transferId',
    as: 'transfer',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // InternalTransferItem belongsTo Product
  InternalTransferItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  
  // InternalTransfer belongsTo Warehouse (source)
  InternalTransfer.belongsTo(Warehouse, {
    foreignKey: 'sourceWarehouseId',
    as: 'sourceWarehouse',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  
  // InternalTransfer belongsTo Warehouse (destination)
  InternalTransfer.belongsTo(Warehouse, {
    foreignKey: 'destinationWarehouseId',
    as: 'destinationWarehouse',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  
  // ============================================
  // WAREHOUSE INVENTORY RELATIONSHIPS
  // ============================================
  
  // WarehouseInventory belongsTo Warehouse
  WarehouseInventory.belongsTo(Warehouse, {
    foreignKey: 'warehouseId',
    as: 'warehouse',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  // WarehouseInventory belongsTo Product
  WarehouseInventory.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  
  console.log('✅ All model associations have been set up successfully');
}

module.exports = { setupAssociations };
