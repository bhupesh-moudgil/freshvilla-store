import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const storeERPAPI = {
  // Dashboard
  getDashboard: async (storeId) => {
    const response = await axios.get(`${API_BASE}/store-erp/${storeId}/dashboard`);
    return response.data;
  },

  // Financial Transactions
  getTransactions: async (storeId, params = {}) => {
    const response = await axios.get(`${API_BASE}/store-erp/${storeId}/transactions`, { params });
    return response.data;
  },

  // Revenue & Reporting
  getRevenueSummary: async (storeId, params = {}) => {
    const response = await axios.get(`${API_BASE}/store-erp/${storeId}/revenue-summary`, { params });
    return response.data;
  },

  getProfitLoss: async (storeId, params = {}) => {
    const response = await axios.get(`${API_BASE}/store-erp/${storeId}/profit-loss`, { params });
    return response.data;
  },

  getSalesAnalytics: async (storeId, params = {}) => {
    const response = await axios.get(`${API_BASE}/store-erp/${storeId}/sales-analytics`, { params });
    return response.data;
  },

  // Inventory Management
  getInventory: async (storeId, params = {}) => {
    const response = await axios.get(`${API_BASE}/store-erp/${storeId}/inventory`, { params });
    return response.data;
  },

  getInventoryLedger: async (storeId, params = {}) => {
    const response = await axios.get(`${API_BASE}/store-erp/${storeId}/inventory/ledger`, { params });
    return response.data;
  },

  adjustInventory: async (storeId, data) => {
    const response = await axios.post(`${API_BASE}/store-erp/${storeId}/inventory/adjust`, data);
    return response.data;
  },

  // Commission Management
  getProductCommissions: async (storeId) => {
    const response = await axios.get(`${API_BASE}/store-erp/${storeId}/commissions`);
    return response.data;
  },

  updateProductCommission: async (storeId, productId, data) => {
    const response = await axios.put(`${API_BASE}/store-erp/${storeId}/commissions/${productId}`, data);
    return response.data;
  },
};

export default storeERPAPI;
