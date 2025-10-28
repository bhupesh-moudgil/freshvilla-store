import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', process.env.NODE_ENV);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try multiple token key names for compatibility
    const token = localStorage.getItem('admin_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('adminToken') ||
                  localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API (Admin)
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
};

// Customer Auth API
export const customerAuthAPI = {
  login: (credentials) => api.post('/customer/auth/login', credentials),
  register: (data) => api.post('/customer/auth/register', data),
  getProfile: () => api.get('/customer/auth/me'),
  verifyOTP: (data) => api.post('/customer/auth/verify-otp', data),
  resendOTP: (data) => api.post('/customer/auth/resend-otp', data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
  getCategories: () => api.get('/products/categories/list'),
};

// Coupons API
export const couponsAPI = {
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
  validate: (code, orderTotal) => api.post('/coupons/validate', { code, orderTotal }),
  toggle: (id) => api.patch(`/coupons/${id}/toggle`),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  getStats: () => api.get('/orders/stats/overview'),
  requestOTP: (data) => api.post('/orders/request-otp', data),
};

// Cities API
export const citiesAPI = {
  getAll: () => api.get('/cities'),
  getStates: () => api.get('/cities/states'),
  getDistricts: (stateCode) => api.get(`/cities/districts/${stateCode}`),
  search: (query) => api.get('/cities/search', { params: { q: query } }),
};

// Stores API
export const storesAPI = {
  getAll: (params) => api.get('/stores', { params }),
  getById: (id) => api.get(`/stores/${id}`),
  getByUrl: (storeUrl) => api.get(`/stores/url/${storeUrl}`),
  getByState: (stateCode) => api.get(`/stores/by-state/${stateCode}`),
  getByCity: (cityCode) => api.get(`/stores/by-city/${cityCode}`),
  create: (data) => api.post('/stores', data),
  update: (id, data) => api.put(`/stores/${id}`, data),
  delete: (id) => api.delete(`/stores/${id}`),
};

// Master ERP API (Super Admin Only)
export const masterERPAPI = {
  getDashboard: () => api.get('/master-erp/dashboard'),
  getSalesAnalytics: (params) => api.get('/master-erp/sales-analytics', { params }),
  getStores: (params) => api.get('/master-erp/stores', { params }),
  getStoreComparison: (storeIds) => api.get('/master-erp/store-comparison', { params: { storeIds } }),
  getRevenueByCategory: (params) => api.get('/master-erp/revenue-by-category', { params }),
};

// Service Areas API
export const serviceAreasAPI = {
  getAll: () => api.get('/service-areas'),
  getById: (id) => api.get(`/service-areas/${id}`),
  create: (data) => api.post('/service-areas', data),
  update: (id, data) => api.put(`/service-areas/${id}`, data),
  delete: (id) => api.delete(`/service-areas/${id}`),
  toggle: (id) => api.patch(`/service-areas/${id}/toggle`),
  checkAvailability: (params) => api.get('/service-areas/check-availability', { params }),
};

// Store Users API
export const storeUsersAPI = {
  getAll: (storeId) => api.get(`/store-users/${storeId}/users`),
  getRoles: () => api.get('/store-users/roles'),
  invite: (storeId, data) => api.post(`/store-users/${storeId}/invite`, data),
  update: (storeId, userId, data) => api.put(`/store-users/${storeId}/users/${userId}`, data),
  remove: (storeId, userId) => api.delete(`/store-users/${storeId}/users/${userId}`),
};

export default api;
