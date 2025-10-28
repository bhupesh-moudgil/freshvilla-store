const { 
  StoreTransaction, 
  InventoryLedger, 
  StoreRevenueSummary, 
  ProductCommission 
} = require('../models/StoreFinancials');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Store = require('../models/Store');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Dashboard Overview
exports.getDashboard = async (req, res) => {
  try {
    const { storeId } = req.params;
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's Metrics
    const todayTransactions = await StoreTransaction.findAll({
      where: {
        storeId,
        transactionDate: { [Op.gte]: startOfToday },
        status: 'completed',
      },
    });

    const todayMetrics = {
      orders: new Set(todayTransactions.map(t => t.orderId)).size,
      grossRevenue: todayTransactions.reduce((sum, t) => sum + parseFloat(t.grossAmount), 0),
      commission: todayTransactions.reduce((sum, t) => sum + parseFloat(t.platformCommission), 0),
      netRevenue: todayTransactions.reduce((sum, t) => sum + parseFloat(t.netAmount), 0),
    };

    // Month-to-Date
    const monthRevenue = await StoreRevenueSummary.findAll({
      where: {
        storeId,
        date: { [Op.gte]: startOfMonth },
      },
    });

    const monthMetrics = monthRevenue.reduce((acc, day) => ({
      orders: acc.orders + day.totalOrders,
      items: acc.items + day.totalItems,
      grossRevenue: acc.grossRevenue + parseFloat(day.grossRevenue),
      commission: acc.commission + parseFloat(day.platformCommission),
      netRevenue: acc.netRevenue + parseFloat(day.netRevenue),
      profit: acc.profit + parseFloat(day.netProfit),
    }), { orders: 0, items: 0, grossRevenue: 0, commission: 0, netRevenue: 0, profit: 0 });

    // Top Products (Last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const topProducts = await sequelize.query(`
      SELECT 
        p.name,
        p.image,
        COUNT(DISTINCT il.id) as sales_count,
        SUM(ABS(il.quantity)) as units_sold,
        SUM(il.totalValue) as revenue,
        pc.storeEarningPerUnit * SUM(ABS(il.quantity)) as store_earning
      FROM inventory_ledger il
      JOIN products p ON il.productId = p.id
      LEFT JOIN product_commissions pc ON p.id = pc.productId
      WHERE il.storeId = :storeId
        AND il.movementType = 'sale'
        AND il.createdAt >= :thirtyDaysAgo
      GROUP BY p.id, p.name, p.image, pc.storeEarningPerUnit
      ORDER BY units_sold DESC
      LIMIT 5
    `, {
      replacements: { storeId, thirtyDaysAgo },
      type: sequelize.QueryTypes.SELECT,
    });

    // Inventory Alerts
    const lowStockProducts = await Product.findAll({
      where: {
        storeId,
        stock: { [Op.lte]: sequelize.col('minStock') },
        minStock: { [Op.gt]: 0 },
        isActive: true,
      },
      attributes: ['id', 'name', 'stock', 'minStock', 'image'],
      order: [['stock', 'ASC']],
      limit: 10,
    });

    const outOfStock = await Product.count({
      where: { storeId, stock: 0, isActive: true },
    });

    // Recent Transactions (last 10)
    const recentTransactions = await StoreTransaction.findAll({
      where: { storeId },
      include: [{
        model: Order,
        as: 'order',
        attributes: ['id', 'orderNumber', 'customerName'],
      }],
      order: [['transactionDate', 'DESC']],
      limit: 10,
    });

    res.json({
      success: true,
      data: {
        today: todayMetrics,
        month: monthMetrics,
        topProducts: topProducts.map(p => ({
          ...p,
          revenue: parseFloat(p.revenue || 0),
          store_earning: parseFloat(p.store_earning || 0),
        })),
        inventoryAlerts: {
          lowStock: lowStockProducts,
          outOfStockCount: outOfStock,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Financial Transactions
exports.getTransactions = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { startDate, endDate, type, status, page = 1, limit = 50 } = req.query;

    const where = { storeId };
    
    if (startDate && endDate) {
      where.transactionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    
    if (type) where.transactionType = type;
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows } = await StoreTransaction.findAndCountAll({
      where,
      include: [{
        model: Order,
        as: 'order',
        attributes: ['orderNumber', 'customerName'],
      }],
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Revenue Summary
exports.getRevenueSummary = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { month, year, startDate, endDate } = req.query;

    let where = { storeId };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      where.date = { [Op.between]: [start, end] };
    } else if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const summary = await StoreRevenueSummary.findAll({
      where,
      order: [['date', 'ASC']],
    });

    const totals = summary.reduce((acc, day) => ({
      orders: acc.orders + day.totalOrders,
      items: acc.items + day.totalItems,
      grossRevenue: acc.grossRevenue + parseFloat(day.grossRevenue),
      commission: acc.commission + parseFloat(day.platformCommission),
      netRevenue: acc.netRevenue + parseFloat(day.netRevenue),
      expenses: acc.expenses + parseFloat(day.totalExpenses),
      profit: acc.profit + parseFloat(day.netProfit),
      refunds: acc.refunds + parseFloat(day.totalRefunds),
    }), { orders: 0, items: 0, grossRevenue: 0, commission: 0, netRevenue: 0, expenses: 0, profit: 0, refunds: 0 });

    res.json({
      success: true,
      data: {
        daily: summary,
        totals,
      },
    });
  } catch (error) {
    console.error('Revenue summary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Profit & Loss Statement
exports.getProfitLoss = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { startDate, endDate } = req.query;

    const where = { storeId };
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const summary = await StoreRevenueSummary.findAll({ where });

    const totals = summary.reduce((acc, day) => ({
      grossSales: acc.grossSales + parseFloat(day.grossRevenue),
      refunds: acc.refunds + parseFloat(day.totalRefunds),
      platformCommission: acc.platformCommission + parseFloat(day.platformCommission),
      expenses: acc.expenses + parseFloat(day.totalExpenses),
    }), { grossSales: 0, refunds: 0, platformCommission: 0, expenses: 0 });

    const netSales = totals.grossSales - totals.refunds;
    const netRevenue = netSales - totals.platformCommission;
    const netProfit = netRevenue - totals.expenses;
    const profitMargin = netSales > 0 ? ((netProfit / netSales) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        income: {
          grossSales: totals.grossSales,
          refunds: totals.refunds,
          netSales,
        },
        deductions: {
          platformCommission: totals.platformCommission,
          netRevenue,
        },
        expenses: {
          total: totals.expenses,
        },
        profit: {
          netProfit,
          profitMargin: `${profitMargin}%`,
        },
      },
    });
  } catch (error) {
    console.error('P&L error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Inventory with Ledger
exports.getInventory = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { search, lowStock } = req.query;

    const where = { storeId, isActive: true };
    
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    
    if (lowStock === 'true') {
      where.stock = { [Op.lte]: sequelize.col('minStock') };
    }

    const products = await Product.findAll({
      where,
      include: [{
        model: ProductCommission,
        as: 'commission',
      }],
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Inventory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Inventory Ledger (History)
exports.getInventoryLedger = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { productId, movementType, startDate, endDate } = req.query;

    const where = { storeId };
    
    if (productId) where.productId = productId;
    if (movementType) where.movementType = movementType;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const ledger = await InventoryLedger.findAll({
      where,
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'image'],
      }],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    console.error('Inventory ledger error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Adjust Inventory Manually
exports.adjustInventory = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { productId, quantity, movementType, notes } = req.body;

    const product = await Product.findOne({ where: { id: productId, storeId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousStock = product.stock;
    const newStock = previousStock + quantity;

    // Update product stock
    await product.update({ stock: newStock });

    // Create ledger entry
    await InventoryLedger.create({
      storeId,
      productId,
      movementType,
      quantity,
      previousStock,
      newStock,
      notes,
      createdBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: { previousStock, newStock, adjustment: quantity },
    });
  } catch (error) {
    console.error('Inventory adjustment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Product Commissions
exports.getProductCommissions = async (req, res) => {
  try {
    const { storeId } = req.params;

    const commissions = await ProductCommission.findAll({
      where: { storeId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'price', 'image'],
      }],
    });

    res.json({
      success: true,
      data: commissions,
    });
  } catch (error) {
    console.error('Product commissions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Product Commission
exports.updateProductCommission = async (req, res) => {
  try {
    const { storeId, productId } = req.params;
    const { commissionType, commissionValue, costPrice, sellingPrice } = req.body;

    let commission = await ProductCommission.findOne({ where: { productId, storeId } });

    // Calculate store earning
    let storeEarning, profitMargin;
    if (commissionType === 'percentage') {
      storeEarning = sellingPrice * (1 - commissionValue / 100);
    } else {
      storeEarning = sellingPrice - commissionValue;
    }

    if (costPrice && sellingPrice) {
      profitMargin = ((storeEarning - costPrice) / costPrice * 100).toFixed(2);
    }

    const data = {
      storeId,
      productId,
      commissionType,
      commissionValue,
      costPrice,
      sellingPrice,
      storeEarningPerUnit: storeEarning,
      profitMargin,
    };

    if (commission) {
      await commission.update(data);
    } else {
      commission = await ProductCommission.create(data);
    }

    res.json({
      success: true,
      message: 'Commission updated successfully',
      data: commission,
    });
  } catch (error) {
    console.error('Update commission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Sales Analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { period = '30days' } = req.query;

    const days = parseInt(period) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const salesTrend = await StoreRevenueSummary.findAll({
      where: {
        storeId,
        date: { [Op.gte]: startDate },
      },
      order: [['date', 'ASC']],
      attributes: ['date', 'totalOrders', 'grossRevenue', 'netRevenue', 'netProfit'],
    });

    res.json({
      success: true,
      data: {
        labels: salesTrend.map(d => d.date),
        orders: salesTrend.map(d => d.totalOrders),
        grossRevenue: salesTrend.map(d => parseFloat(d.grossRevenue)),
        netRevenue: salesTrend.map(d => parseFloat(d.netRevenue)),
        profit: salesTrend.map(d => parseFloat(d.netProfit)),
      },
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
