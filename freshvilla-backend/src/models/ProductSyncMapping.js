const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductSyncMapping = sequelize.define('ProductSyncMapping', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  integrationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'store_integrations',
      key: 'id',
    },
  },
  freshvillaProductId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  externalProductId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Product ID in the external store',
  },
  externalVariantId: {
    type: DataTypes.STRING,
    comment: 'Variant ID if applicable',
  },
  externalSku: {
    type: DataTypes.STRING,
  },
  syncDirection: {
    type: DataTypes.ENUM('freshvilla_to_external', 'external_to_freshvilla', 'bidirectional'),
    defaultValue: 'bidirectional',
  },
  lastSyncAt: {
    type: DataTypes.DATE,
  },
  lastSyncedData: {
    type: DataTypes.JSONB,
    comment: 'Snapshot of last synced data for comparison',
  },
  syncStatus: {
    type: DataTypes.ENUM('synced', 'pending', 'error', 'conflict'),
    defaultValue: 'synced',
  },
  syncError: {
    type: DataTypes.TEXT,
  },
  conflictData: {
    type: DataTypes.JSONB,
    comment: 'Data showing conflicts between stores',
  },
}, {
  tableName: 'product_sync_mappings',
  timestamps: true,
  indexes: [
    { fields: ['integrationId'] },
    { fields: ['freshvillaProductId'] },
    { fields: ['externalProductId'] },
    { unique: true, fields: ['integrationId', 'externalProductId'] },
  ],
});

module.exports = ProductSyncMapping;
