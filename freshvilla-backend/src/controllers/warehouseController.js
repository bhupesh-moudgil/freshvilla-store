const { Op } = require('sequelize');
const Warehouse = require('../models/Warehouse');
const WarehouseInventory = require('../models/WarehouseInventory');
const InternalTransfer = require('../models/InternalTransfer');
const { sequelize } = require('../config/database');

// @desc    Get Warehouse Dashboard
// @route   GET /api/warehouses/:id/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    
    const warehouse = await Warehouse.findByPk(id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    
    // Capacity metrics
    const capacityMetrics = {
      total: parseFloat(warehouse.totalCapacitySqFt),
      used: parseFloat(warehouse.usedCapacitySqFt),
      available: parseFloat(warehouse.availableCapacitySqFt),
      utilizationPercent: warehouse.totalCapacitySqFt > 0 
        ? ((warehouse.usedCapacitySqFt / warehouse.totalCapacitySqFt) * 100).toFixed(2)
        : 0,
    };
    
    // Inventory summary
    const inventorySummary = await WarehouseInventory.findAll({
      where: { warehouseId: id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalProducts'],
        [sequelize.fn('SUM', sequelize.col('currentStock')), 'totalStock'],
        [sequelize.fn('SUM', sequelize.col('availableStock')), 'availableStock'],
        [sequelize.fn('SUM', sequelize.col('reservedStock')), 'reservedStock'],
        [sequelize.fn('SUM', sequelize.col('damagedStock')), 'damagedStock'],
      ],
      raw: true,
    });
    
    // Low stock alerts
    const lowStockProducts = await WarehouseInventory.findAll({
      where: {
        warehouseId: id,
        currentStock: { [Op.lte]: sequelize.col('reorderPoint') },
      },
      limit: 10,
      order: [['currentStock', 'ASC']],
    });
    
    // Expiry alerts (products expiring in next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiryAlerts = await WarehouseInventory.findAll({
      where: {
        warehouseId: id,
        expiryDate: {
          [Op.between]: [new Date(), thirtyDaysFromNow],
        },
      },
      order: [['expiryDate', 'ASC']],
      limit: 10,
    });
    
    // Recent transfers
    const recentTransfers = await InternalTransfer.findAll({
      where: {
        [Op.or]: [
          { sourceId: id, sourceType: 'warehouse' },
          { destinationId: id, destinationType: 'warehouse' },
        ],
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    
    res.json({
      success: true,
      data: {
        warehouse,
        capacity: capacityMetrics,
        inventory: inventorySummary[0] || {
          totalProducts: 0,
          totalStock: 0,
          availableStock: 0,
          reservedStock: 0,
          damagedStock: 0,
        },
        alerts: {
          lowStock: lowStockProducts,
          expiringSoon: expiryAlerts,
        },
        recentTransfers,
      },
    });
  } catch (error) {
    console.error('Warehouse dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Warehouses
// @route   GET /api/warehouses
// @access  Private
exports.getAllWarehouses = async (req, res) => {
  try {
    const { status, state, city, type } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (state) where.state = state;
    if (city) where.city = city;
    if (type) where.warehouseType = type;
    
    const warehouses = await Warehouse.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    
    res.json({
      success: true,
      count: warehouses.length,
      data: warehouses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Warehouse
// @route   GET /api/warehouses/:id
// @access  Private
exports.getWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    
    res.json({ success: true, data: warehouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Warehouse
// @route   POST /api/warehouses
// @access  Private (Super Admin)
exports.createWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.create({
      ...req.body,
      createdBy: req.admin?.id,
    });
    
    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      data: warehouse,
    });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Warehouse
// @route   PUT /api/warehouses/:id
// @access  Private (Super Admin)
exports.updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    
    await warehouse.update(req.body);
    
    res.json({
      success: true,
      message: 'Warehouse updated successfully',
      data: warehouse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private (Super Admin)
exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);
    
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    
    // Check if warehouse has inventory
    const inventoryCount = await WarehouseInventory.count({
      where: { warehouseId: req.params.id, currentStock: { [Op.gt]: 0 } },
    });
    
    if (inventoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete warehouse with active inventory. Please transfer stock first.',
      });
    }
    
    await warehouse.destroy();
    
    res.json({
      success: true,
      message: 'Warehouse deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Warehouse Inventory
// @route   GET /api/warehouses/:id/inventory
// @access  Private
exports.getWarehouseInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { search, lowStock, category } = req.query;
    
    const where = { warehouseId: id };
    
    if (search) {
      where.productName = { [Op.iLike]: `%${search}%` };
    }
    
    if (lowStock === 'true') {
      where.currentStock = { [Op.lte]: sequelize.col('reorderPoint') };
    }
    
    if (category) {
      where.category = category;
    }
    
    const inventory = await WarehouseInventory.findAll({
      where,
      order: [['productName', 'ASC']],
    });
    
    res.json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Warehouse Inventory
// @route   PUT /api/warehouses/:warehouseId/inventory/:inventoryId
// @access  Private
exports.updateInventory = async (req, res) => {
  try {
    const { warehouseId, inventoryId } = req.params;
    
    const inventory = await WarehouseInventory.findOne({
      where: { id: inventoryId, warehouseId },
    });
    
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    
    await inventory.update(req.body);
    
    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Adjust Inventory Stock
// @route   POST /api/warehouses/:warehouseId/inventory/:inventoryId/adjust
// @access  Private
exports.adjustInventoryStock = async (req, res) => {
  try {
    const { warehouseId, inventoryId } = req.params;
    const { adjustment, reason } = req.body;
    
    const inventory = await WarehouseInventory.findOne({
      where: { id: inventoryId, warehouseId },
    });
    
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    
    const previousStock = inventory.currentStock;
    const newStock = previousStock + adjustment;
    
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment would result in negative stock',
      });
    }
    
    // Update stock
    await inventory.update({
      currentStock: newStock,
      availableStock: inventory.availableStock + adjustment,
    });
    
    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        previousStock,
        newStock,
        adjustment,
        reason,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Warehouse Capacity Report
// @route   GET /api/warehouses/:id/capacity-report
// @access  Private
exports.getCapacityReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const warehouse = await Warehouse.findByPk(id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    
    const inventoryByCategory = await sequelize.query(`
      SELECT 
        category,
        COUNT(*) as product_count,
        SUM(current_stock) as total_stock,
        SUM(available_stock) as available_stock,
        SUM(reserved_stock) as reserved_stock
      FROM warehouse_inventory
      WHERE warehouse_id = :warehouseId
      GROUP BY category
      ORDER BY total_stock DESC
    `, {
      replacements: { warehouseId: id },
      type: sequelize.QueryTypes.SELECT,
    });
    
    res.json({
      success: true,
      data: {
        warehouse: {
          name: warehouse.warehouseName,
          totalCapacity: parseFloat(warehouse.totalCapacitySqFt),
          usedCapacity: parseFloat(warehouse.usedCapacitySqFt),
          availableCapacity: parseFloat(warehouse.availableCapacitySqFt),
          utilizationPercent: warehouse.totalCapacitySqFt > 0
            ? ((warehouse.usedCapacitySqFt / warehouse.totalCapacitySqFt) * 100).toFixed(2)
            : 0,
        },
        inventoryBreakdown: inventoryByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
