const { Op } = require('sequelize');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Product = require('../models/Product');
const sequelize = require('../config/database');

/**
 * Master ERP Dashboard - Pan India Metrics
 * Only accessible to super admin (admin@freshvilla.in)
 */

// @desc    Get Master Dashboard Overview
// @route   GET /api/master-erp/dashboard
// @access  Private (Super Admin only)
exports.getMasterDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Total Active Stores
    const totalStores = await Store.count({ where: { isActive: true } });
    
    // Total Orders (Today)
    const todayOrders = await Order.count({
      where: {
        createdAt: { [Op.gte]: today }
      }
    });
    
    // Total Revenue (Today)
    const todayRevenue = await Order.sum('total', {
      where: {
        createdAt: { [Op.gte]: today },
        orderStatus: { [Op.notIn]: ['Cancelled', 'Refunded'] }
      }
    }) || 0;
    
    // Total Orders (This Month)
    const monthOrders = await Order.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });
    
    // Total Revenue (This Month)
    const monthRevenue = await Order.sum('total', {
      where: {
        createdAt: { [Op.gte]: startOfMonth },
        orderStatus: { [Op.notIn]: ['Cancelled', 'Refunded'] }
      }
    }) || 0;
    
    // Total Products Across All Stores
    const totalProducts = await Product.count({ where: { isActive: true } });
    
    // Platform Commission (Today)
    const todayCommission = todayRevenue * 0.15; // 15% platform fee
    
    // Platform Commission (This Month)
    const monthCommission = monthRevenue * 0.15;
    
    // Top Performing Stores
    const topStores = await sequelize.query(`
      SELECT 
        s.id,
        s.name,
        s."storeNumber",
        s."storeUrl",
        s.city,
        s."cityCode",
        s.state,
        s."stateCode",
        COUNT(o.id) as "totalOrders",
        COALESCE(SUM(o.total), 0) as "totalRevenue"
      FROM stores s
      LEFT JOIN orders o ON s.id::text = o."storeId" 
        AND o."orderStatus" NOT IN ('Cancelled', 'Refunded')
        AND o."createdAt" >= :startOfMonth
      WHERE s."isActive" = true
      GROUP BY s.id
      ORDER BY "totalRevenue" DESC
      LIMIT 10
    `, {
      replacements: { startOfMonth },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Orders by State
    const ordersByState = await sequelize.query(`
      SELECT 
        s.state,
        s."stateCode",
        COUNT(o.id) as "orderCount",
        COALESCE(SUM(o.total), 0) as "revenue"
      FROM stores s
      LEFT JOIN orders o ON s.id::text = o."storeId" 
        AND o."orderStatus" NOT IN ('Cancelled', 'Refunded')
        AND o."createdAt" >= :startOfMonth
      WHERE s."isActive" = true AND s.state IS NOT NULL
      GROUP BY s.state, s."stateCode"
      ORDER BY "revenue" DESC
      LIMIT 15
    `, {
      replacements: { startOfMonth },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalStores,
          totalProducts,
          today: {
            orders: todayOrders,
            revenue: parseFloat(todayRevenue).toFixed(2),
            commission: parseFloat(todayCommission).toFixed(2)
          },
          month: {
            orders: monthOrders,
            revenue: parseFloat(monthRevenue).toFixed(2),
            commission: parseFloat(monthCommission).toFixed(2)
          }
        },
        topStores,
        ordersByState
      }
    });
  } catch (error) {
    console.error('Master Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get Sales Analytics (Pan India)
// @route   GET /api/master-erp/sales-analytics
// @access  Private (Super Admin only)
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = 30 } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // Daily sales trend
    const salesTrend = await sequelize.query(`
      SELECT 
        DATE(o."createdAt") as date,
        COUNT(o.id) as orders,
        COALESCE(SUM(o.total), 0) as revenue,
        COALESCE(SUM(o.total * 0.15), 0) as commission
      FROM orders o
      WHERE o."createdAt" >= :startDate
        AND o."orderStatus" NOT IN ('Cancelled', 'Refunded')
      GROUP BY DATE(o."createdAt")
      ORDER BY date ASC
    `, {
      replacements: { startDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Revenue by store
    const revenueByStore = await sequelize.query(`
      SELECT 
        s.name as "storeName",
        s."storeUrl",
        s.city,
        s.state,
        COUNT(o.id) as orders,
        COALESCE(SUM(o.total), 0) as revenue
      FROM stores s
      LEFT JOIN orders o ON s.id::text = o."storeId" 
        AND o."orderStatus" NOT IN ('Cancelled', 'Refunded')
        AND o."createdAt" >= :startDate
      WHERE s."isActive" = true
      GROUP BY s.id, s.name, s."storeUrl", s.city, s.state
      ORDER BY revenue DESC
    `, {
      replacements: { startDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      data: {
        period: parseInt(period),
        salesTrend,
        revenueByStore
      }
    });
  } catch (error) {
    console.error('Sales Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get All Stores List
// @route   GET /api/master-erp/stores
// @access  Private (Super Admin only)
exports.getAllStores = async (req, res) => {
  try {
    const { active, state, city } = req.query;
    
    const where = {};
    if (active !== undefined) where.isActive = active === 'true';
    if (state) where.state = state;
    if (city) where.city = city;
    
    const stores = await Store.findAll({
      where,
      attributes: [
        'id',
        'name',
        'slug',
        'storeNumber',
        'storeUrl',
        'city',
        'cityCode',
        'state',
        'stateCode',
        'email',
        'phone',
        'isActive',
        'isFeatured',
        'totalProducts',
        'totalOrders',
        'rating',
        'commission',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get Store Performance Comparison
// @route   GET /api/master-erp/store-comparison
// @access  Private (Super Admin only)
exports.getStoreComparison = async (req, res) => {
  try {
    const { storeIds } = req.query; // comma-separated store IDs
    
    if (!storeIds) {
      return res.status(400).json({
        success: false,
        message: 'Please provide store IDs'
      });
    }
    
    const ids = storeIds.split(',');
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const comparison = await Promise.all(ids.map(async (storeId) => {
      const store = await Store.findByPk(storeId);
      if (!store) return null;
      
      const orders = await Order.count({
        where: {
          storeId,
          createdAt: { [Op.gte]: startOfMonth },
          orderStatus: { [Op.notIn]: ['Cancelled', 'Refunded'] }
        }
      });
      
      const revenue = await Order.sum('total', {
        where: {
          storeId,
          createdAt: { [Op.gte]: startOfMonth },
          orderStatus: { [Op.notIn]: ['Cancelled', 'Refunded'] }
        }
      }) || 0;
      
      const products = await Product.count({
        where: { storeId, isActive: true }
      });
      
      return {
        storeId: store.id,
        storeName: store.name,
        storeUrl: store.storeUrl,
        city: store.city,
        state: store.state,
        orders,
        revenue: parseFloat(revenue).toFixed(2),
        products,
        avgOrderValue: orders > 0 ? parseFloat(revenue / orders).toFixed(2) : 0
      };
    }));
    
    res.json({
      success: true,
      data: comparison.filter(c => c !== null)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get Revenue by Category (Pan India)
// @route   GET /api/master-erp/revenue-by-category
// @access  Private (Super Admin only)
exports.getRevenueByCategory = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const categoryRevenue = await sequelize.query(`
      SELECT 
        p.category,
        COUNT(DISTINCT oi."orderId") as orders,
        SUM(oi.quantity) as "unitsSold",
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN products p ON oi."productId" = p.id
      JOIN orders o ON oi."orderId" = o.id
      WHERE o."createdAt" >= :startDate
        AND o."orderStatus" NOT IN ('Cancelled', 'Refunded')
      GROUP BY p.category
      ORDER BY revenue DESC
    `, {
      replacements: { startDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      data: categoryRevenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
