const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StoreIntegration = sequelize.define('StoreIntegration', {
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
  platform: {
    type: DataTypes.ENUM(
      'shopify',
      'woocommerce',
      'magento',
      'bigcommerce',
      'prestashop',
      'opencart',
      'custom_api'
    ),
    allowNull: false,
  },
  storeName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Display name of the connected store',
  },
  storeUrl: {
    type: DataTypes.STRING,
    comment: 'URL of the external store',
  },
  apiEndpoint: {
    type: DataTypes.STRING,
    comment: 'API endpoint for custom integrations',
  },
  credentials: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Encrypted API credentials (API key, secret, token, etc.)',
  },
  syncSettings: {
    type: DataTypes.JSONB,
    defaultValue: {
      syncProducts: true,
      syncInventory: true,
      syncOrders: false,
      syncPrices: true,
      autoSync: true,
      syncInterval: 300, // seconds (5 minutes)
      inventorySource: 'freshvilla', // 'freshvilla' | 'external' | 'bidirectional'
    },
  },
  fieldMapping: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Maps FreshVilla fields to external store fields',
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'error', 'disconnected'),
    defaultValue: 'active',
  },
  lastSyncAt: {
    type: DataTypes.DATE,
  },
  lastSyncStatus: {
    type: DataTypes.ENUM('success', 'partial', 'failed'),
  },
  lastSyncError: {
    type: DataTypes.TEXT,
  },
  syncStats: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      productsSync: 0,
      inventoryUpdates: 0,
      lastSyncDuration: 0,
    },
  },
  webhookUrl: {
    type: DataTypes.STRING,
    comment: 'Webhook URL for receiving real-time updates from external store',
  },
  webhookSecret: {
    type: DataTypes.STRING,
    comment: 'Secret for validating webhook requests',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'store_integrations',
  timestamps: true,
  indexes: [
    { fields: ['storeId'] },
    { fields: ['platform'] },
    { fields: ['status'] },
  ],
});

module.exports = StoreIntegration;
