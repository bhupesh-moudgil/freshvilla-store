const StoreIntegration = require('../../models/StoreIntegration');
const ProductSyncMapping = require('../../models/ProductSyncMapping');
const Product = require('../../models/Product');
const InventoryLedger = require('../../models/StoreFinancials').InventoryLedger;
const { createPlatformAdapter } = require('./platformAdapters');

class SyncService {
  constructor(integrationId) {
    this.integrationId = integrationId;
    this.integration = null;
    this.adapter = null;
  }

  async initialize() {
    this.integration = await StoreIntegration.findByPk(this.integrationId);
    if (!this.integration) {
      throw new Error('Integration not found');
    }

    this.adapter = createPlatformAdapter(
      this.integration.platform,
      this.integration.credentials,
      {
        apiEndpoint: this.integration.apiEndpoint,
        storeUrl: this.integration.storeUrl,
      }
    );
  }

  // Full sync: Import all products from external store
  async syncProductsFromExternal() {
    const startTime = Date.now();
    const results = {
      imported: 0,
      updated: 0,
      errors: [],
    };

    try {
      const externalProducts = await this.adapter.getProducts();

      for (const externalProduct of externalProducts) {
        try {
          await this.importProduct(externalProduct);
          results.imported++;
        } catch (error) {
          results.errors.push({
            externalId: externalProduct.externalId,
            error: error.message,
          });
        }
      }

      // Update sync stats
      await this.updateSyncStats('success', Date.now() - startTime, results);
      
      return results;
    } catch (error) {
      await this.updateSyncStats('failed', Date.now() - startTime, null, error.message);
      throw error;
    }
  }

  // Import single product from external store
  async importProduct(externalProduct) {
    const { externalId, externalVariantId } = externalProduct;

    // Check if product already mapped
    let mapping = await ProductSyncMapping.findOne({
      where: {
        integrationId: this.integrationId,
        externalProductId: externalId,
      },
    });

    if (mapping) {
      // Update existing product
      const product = await Product.findByPk(mapping.freshvillaProductId);
      if (product) {
        await product.update({
          name: externalProduct.name,
          description: externalProduct.description,
          price: externalProduct.price,
          stock: externalProduct.stock,
          image: externalProduct.image,
        });

        await mapping.update({
          lastSyncAt: new Date(),
          lastSyncedData: externalProduct,
          syncStatus: 'synced',
        });

        return product;
      }
    }

    // Create new product
    const product = await Product.create({
      storeId: this.integration.storeId,
      name: externalProduct.name,
      description: externalProduct.description,
      price: externalProduct.price,
      stock: externalProduct.stock,
      image: externalProduct.image,
      sku: externalProduct.sku,
      isActive: externalProduct.status,
    });

    // Create mapping
    await ProductSyncMapping.create({
      integrationId: this.integrationId,
      freshvillaProductId: product.id,
      externalProductId: externalId,
      externalVariantId,
      externalSku: externalProduct.sku,
      syncDirection: 'bidirectional',
      lastSyncAt: new Date(),
      lastSyncedData: externalProduct,
      syncStatus: 'synced',
    });

    return product;
  }

  // Push products to external store
  async syncProductsToExternal(productIds = null) {
    const startTime = Date.now();
    const results = {
      created: 0,
      updated: 0,
      errors: [],
    };

    try {
      const where = { storeId: this.integration.storeId };
      if (productIds) {
        where.id = productIds;
      }

      const products = await Product.findAll({ where });

      for (const product of products) {
        try {
          await this.exportProduct(product);
          results.updated++;
        } catch (error) {
          results.errors.push({
            productId: product.id,
            error: error.message,
          });
        }
      }

      await this.updateSyncStats('success', Date.now() - startTime, results);
      
      return results;
    } catch (error) {
      await this.updateSyncStats('failed', Date.now() - startTime, null, error.message);
      throw error;
    }
  }

  // Export single product to external store
  async exportProduct(product) {
    const mapping = await ProductSyncMapping.findOne({
      where: {
        integrationId: this.integrationId,
        freshvillaProductId: product.id,
      },
    });

    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      image: product.image,
      status: product.isActive,
    };

    if (mapping) {
      // Update existing product
      const externalProduct = await this.adapter.updateProduct(
        mapping.externalProductId,
        productData
      );

      await mapping.update({
        lastSyncAt: new Date(),
        lastSyncedData: externalProduct,
        syncStatus: 'synced',
      });

      return externalProduct;
    } else {
      // Create new product
      const externalProduct = await this.adapter.createProduct(productData);

      await ProductSyncMapping.create({
        integrationId: this.integrationId,
        freshvillaProductId: product.id,
        externalProductId: externalProduct.externalId,
        externalVariantId: externalProduct.externalVariantId,
        externalSku: externalProduct.sku,
        syncDirection: 'bidirectional',
        lastSyncAt: new Date(),
        lastSyncedData: externalProduct,
        syncStatus: 'synced',
      });

      return externalProduct;
    }
  }

  // Sync inventory only (bidirectional)
  async syncInventory() {
    const startTime = Date.now();
    const results = {
      updated: 0,
      errors: [],
    };

    try {
      const { inventorySource } = this.integration.syncSettings;

      const mappings = await ProductSyncMapping.findAll({
        where: { integrationId: this.integrationId },
        include: [{ model: Product, as: 'product' }],
      });

      for (const mapping of mappings) {
        try {
          if (inventorySource === 'freshvilla') {
            // Push FreshVilla inventory to external store
            await this.adapter.updateInventory(
              mapping.externalVariantId || mapping.externalProductId,
              mapping.product.stock
            );
          } else if (inventorySource === 'external') {
            // Pull inventory from external store
            const externalProduct = await this.adapter.getProduct(mapping.externalProductId);
            await mapping.product.update({ stock: externalProduct.stock });

            // Log inventory change
            await InventoryLedger.create({
              storeId: this.integration.storeId,
              productId: mapping.freshvillaProductId,
              movementType: 'sync',
              quantity: externalProduct.stock - mapping.product.stock,
              previousStock: mapping.product.stock,
              newStock: externalProduct.stock,
              notes: `Synced from ${this.integration.platform}`,
            });
          }

          results.updated++;
        } catch (error) {
          results.errors.push({
            productId: mapping.freshvillaProductId,
            error: error.message,
          });
        }
      }

      await this.updateSyncStats('success', Date.now() - startTime, results);
      
      return results;
    } catch (error) {
      await this.updateSyncStats('failed', Date.now() - startTime, null, error.message);
      throw error;
    }
  }

  // Update single product inventory
  async syncProductInventory(productId, newStock) {
    const mapping = await ProductSyncMapping.findOne({
      where: {
        integrationId: this.integrationId,
        freshvillaProductId: productId,
      },
    });

    if (!mapping) {
      throw new Error('Product not synced with external store');
    }

    const { inventorySource } = this.integration.syncSettings;

    if (inventorySource === 'external') {
      // Don't push if external is source
      return { skipped: true, reason: 'External store is inventory source' };
    }

    // Push to external store
    await this.adapter.updateInventory(
      mapping.externalVariantId || mapping.externalProductId,
      newStock
    );

    await mapping.update({
      lastSyncAt: new Date(),
      syncStatus: 'synced',
    });

    return { success: true };
  }

  // Update sync statistics
  async updateSyncStats(status, duration, results, error = null) {
    const stats = this.integration.syncStats;
    
    stats.totalSyncs++;
    if (status === 'success') {
      stats.successfulSyncs++;
    } else {
      stats.failedSyncs++;
    }
    stats.lastSyncDuration = duration;
    
    if (results) {
      stats.productsSync += results.imported || results.updated || 0;
      stats.inventoryUpdates += results.updated || 0;
    }

    await this.integration.update({
      lastSyncAt: new Date(),
      lastSyncStatus: status,
      lastSyncError: error,
      syncStats: stats,
      status: error ? 'error' : 'active',
    });
  }

  // Get sync conflicts
  async getSyncConflicts() {
    const conflicts = await ProductSyncMapping.findAll({
      where: {
        integrationId: this.integrationId,
        syncStatus: 'conflict',
      },
      include: [{ model: Product, as: 'product' }],
    });

    return conflicts;
  }

  // Resolve conflict
  async resolveConflict(mappingId, resolution) {
    const mapping = await ProductSyncMapping.findByPk(mappingId, {
      include: [{ model: Product, as: 'product' }],
    });

    if (!mapping) {
      throw new Error('Mapping not found');
    }

    if (resolution === 'use_freshvilla') {
      await this.exportProduct(mapping.product);
    } else if (resolution === 'use_external') {
      const externalProduct = await this.adapter.getProduct(mapping.externalProductId);
      await this.importProduct(externalProduct);
    }

    await mapping.update({
      syncStatus: 'synced',
      conflictData: null,
    });
  }
}

module.exports = SyncService;
