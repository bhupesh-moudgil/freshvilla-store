const axios = require('axios');
const crypto = require('crypto');

// Base adapter class
class BasePlatformAdapter {
  constructor(credentials, config) {
    this.credentials = credentials;
    this.config = config;
  }

  async testConnection() {
    throw new Error('testConnection must be implemented by platform adapter');
  }

  async getProducts() {
    throw new Error('getProducts must be implemented by platform adapter');
  }

  async getProduct(externalId) {
    throw new Error('getProduct must be implemented by platform adapter');
  }

  async updateInventory(externalId, quantity) {
    throw new Error('updateInventory must be implemented by platform adapter');
  }

  async createProduct(productData) {
    throw new Error('createProduct must be implemented by platform adapter');
  }

  async updateProduct(externalId, productData) {
    throw new Error('updateProduct must be implemented by platform adapter');
  }
}

// Shopify Adapter
class ShopifyAdapter extends BasePlatformAdapter {
  constructor(credentials, config) {
    super(credentials, config);
    this.baseUrl = `https://${credentials.shopDomain}/admin/api/2024-01`;
    this.headers = {
      'X-Shopify-Access-Token': credentials.accessToken,
      'Content-Type': 'application/json',
    };
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/shop.json`, { headers: this.headers });
      return { success: true, shop: response.data.shop };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getProducts(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/products.json`, {
        headers: this.headers,
        params: { limit: 250, ...params },
      });
      return response.data.products.map(this.normalizeProduct);
    } catch (error) {
      throw new Error(`Shopify getProducts error: ${error.message}`);
    }
  }

  async getProduct(externalId) {
    try {
      const response = await axios.get(`${this.baseUrl}/products/${externalId}.json`, {
        headers: this.headers,
      });
      return this.normalizeProduct(response.data.product);
    } catch (error) {
      throw new Error(`Shopify getProduct error: ${error.message}`);
    }
  }

  async updateInventory(externalId, quantity, locationId = null) {
    try {
      const inventoryItemId = await this.getInventoryItemId(externalId);
      const inventoryLevelUrl = `${this.baseUrl}/inventory_levels/set.json`;
      
      const response = await axios.post(
        inventoryLevelUrl,
        {
          location_id: locationId || this.credentials.locationId,
          inventory_item_id: inventoryItemId,
          available: quantity,
        },
        { headers: this.headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`Shopify updateInventory error: ${error.message}`);
    }
  }

  async getInventoryItemId(variantId) {
    const response = await axios.get(`${this.baseUrl}/variants/${variantId}.json`, {
      headers: this.headers,
    });
    return response.data.variant.inventory_item_id;
  }

  async createProduct(productData) {
    try {
      const shopifyProduct = this.denormalizeProduct(productData);
      const response = await axios.post(
        `${this.baseUrl}/products.json`,
        { product: shopifyProduct },
        { headers: this.headers }
      );
      return this.normalizeProduct(response.data.product);
    } catch (error) {
      throw new Error(`Shopify createProduct error: ${error.message}`);
    }
  }

  async updateProduct(externalId, productData) {
    try {
      const shopifyProduct = this.denormalizeProduct(productData);
      const response = await axios.put(
        `${this.baseUrl}/products/${externalId}.json`,
        { product: shopifyProduct },
        { headers: this.headers }
      );
      return this.normalizeProduct(response.data.product);
    } catch (error) {
      throw new Error(`Shopify updateProduct error: ${error.message}`);
    }
  }

  normalizeProduct(shopifyProduct) {
    const variant = shopifyProduct.variants?.[0] || {};
    return {
      externalId: shopifyProduct.id.toString(),
      externalVariantId: variant.id?.toString(),
      name: shopifyProduct.title,
      description: shopifyProduct.body_html,
      price: parseFloat(variant.price || 0),
      compareAtPrice: parseFloat(variant.compare_at_price || 0),
      sku: variant.sku,
      stock: variant.inventory_quantity || 0,
      image: shopifyProduct.images?.[0]?.src || null,
      images: shopifyProduct.images?.map(img => img.src) || [],
      status: shopifyProduct.status === 'active',
      tags: shopifyProduct.tags?.split(',').map(t => t.trim()) || [],
      distributor: shopifyProduct.distributor,
    };
  }

  denormalizeProduct(productData) {
    return {
      title: productData.name,
      body_html: productData.description,
      distributor: productData.distributor || 'FreshVilla',
      product_type: productData.category,
      tags: productData.tags?.join(',') || '',
      variants: [{
        price: productData.price?.toString(),
        compare_at_price: productData.compareAtPrice?.toString(),
        sku: productData.sku,
        inventory_quantity: productData.stock,
        inventory_management: 'shopify',
      }],
      images: productData.images?.map(url => ({ src: url })) || [],
    };
  }
}

// WooCommerce Adapter
class WooCommerceAdapter extends BasePlatformAdapter {
  constructor(credentials, config) {
    super(credentials, config);
    this.baseUrl = `${credentials.storeUrl}/wp-json/wc/v3`;
    this.auth = {
      username: credentials.consumerKey,
      password: credentials.consumerSecret,
    };
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/system_status`, { auth: this.auth });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getProducts(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/products`, {
        auth: this.auth,
        params: { per_page: 100, ...params },
      });
      return response.data.map(this.normalizeProduct);
    } catch (error) {
      throw new Error(`WooCommerce getProducts error: ${error.message}`);
    }
  }

  async getProduct(externalId) {
    try {
      const response = await axios.get(`${this.baseUrl}/products/${externalId}`, {
        auth: this.auth,
      });
      return this.normalizeProduct(response.data);
    } catch (error) {
      throw new Error(`WooCommerce getProduct error: ${error.message}`);
    }
  }

  async updateInventory(externalId, quantity) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/products/${externalId}`,
        { stock_quantity: quantity },
        { auth: this.auth }
      );
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(`WooCommerce updateInventory error: ${error.message}`);
    }
  }

  async createProduct(productData) {
    try {
      const wooProduct = this.denormalizeProduct(productData);
      const response = await axios.post(
        `${this.baseUrl}/products`,
        wooProduct,
        { auth: this.auth }
      );
      return this.normalizeProduct(response.data);
    } catch (error) {
      throw new Error(`WooCommerce createProduct error: ${error.message}`);
    }
  }

  async updateProduct(externalId, productData) {
    try {
      const wooProduct = this.denormalizeProduct(productData);
      const response = await axios.put(
        `${this.baseUrl}/products/${externalId}`,
        wooProduct,
        { auth: this.auth }
      );
      return this.normalizeProduct(response.data);
    } catch (error) {
      throw new Error(`WooCommerce updateProduct error: ${error.message}`);
    }
  }

  normalizeProduct(wooProduct) {
    return {
      externalId: wooProduct.id.toString(),
      name: wooProduct.name,
      description: wooProduct.description,
      price: parseFloat(wooProduct.price || 0),
      compareAtPrice: parseFloat(wooProduct.regular_price || 0),
      sku: wooProduct.sku,
      stock: wooProduct.stock_quantity || 0,
      image: wooProduct.images?.[0]?.src || null,
      images: wooProduct.images?.map(img => img.src) || [],
      status: wooProduct.status === 'publish',
      tags: wooProduct.tags?.map(t => t.name) || [],
      categories: wooProduct.categories?.map(c => c.name) || [],
    };
  }

  denormalizeProduct(productData) {
    return {
      name: productData.name,
      description: productData.description,
      regular_price: productData.price?.toString(),
      sale_price: productData.compareAtPrice?.toString(),
      sku: productData.sku,
      stock_quantity: productData.stock,
      manage_stock: true,
      status: productData.status ? 'publish' : 'draft',
      images: productData.images?.map(url => ({ src: url })) || [],
      tags: productData.tags?.map(name => ({ name })) || [],
    };
  }
}

// Custom API Adapter
class CustomAPIAdapter extends BasePlatformAdapter {
  constructor(credentials, config) {
    super(credentials, config);
    this.baseUrl = config.apiEndpoint;
    this.headers = {
      'Authorization': `Bearer ${credentials.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, { headers: this.headers });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getProducts() {
    const response = await axios.get(`${this.baseUrl}/products`, { headers: this.headers });
    return response.data;
  }

  async getProduct(externalId) {
    const response = await axios.get(`${this.baseUrl}/products/${externalId}`, {
      headers: this.headers,
    });
    return response.data;
  }

  async updateInventory(externalId, quantity) {
    const response = await axios.patch(
      `${this.baseUrl}/products/${externalId}/inventory`,
      { quantity },
      { headers: this.headers }
    );
    return response.data;
  }

  async createProduct(productData) {
    const response = await axios.post(
      `${this.baseUrl}/products`,
      productData,
      { headers: this.headers }
    );
    return response.data;
  }

  async updateProduct(externalId, productData) {
    const response = await axios.put(
      `${this.baseUrl}/products/${externalId}`,
      productData,
      { headers: this.headers }
    );
    return response.data;
  }
}

// Adapter Factory
function createPlatformAdapter(platform, credentials, config) {
  switch (platform) {
    case 'shopify':
      return new ShopifyAdapter(credentials, config);
    case 'woocommerce':
      return new WooCommerceAdapter(credentials, config);
    case 'custom_api':
      return new CustomAPIAdapter(credentials, config);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

module.exports = {
  BasePlatformAdapter,
  ShopifyAdapter,
  WooCommerceAdapter,
  CustomAPIAdapter,
  createPlatformAdapter,
};
