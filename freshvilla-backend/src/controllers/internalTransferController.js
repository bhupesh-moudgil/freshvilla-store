const { Op } = require('sequelize');
const InternalTransfer = require('../models/InternalTransfer');
const InternalTransferItem = require('../models/InternalTransferItem');
const Warehouse = require('../models/Warehouse');
const WarehouseInventory = require('../models/WarehouseInventory');
const Store = require('../models/Store');
const Product = require('../models/Product');
const sequelize = require('../config/database');

// @desc    Create internal transfer
// @route   POST /api/internal-transfers
// @access  Private
exports.createTransfer = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const {
      fromType,
      fromId,
      toType,
      toId,
      items,
      transferReason,
      notes,
      requestedBy
    } = req.body;
    
    // Validate locations
    if (fromType === 'warehouse') {
      const warehouse = await Warehouse.findByPk(fromId);
      if (!warehouse) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Source warehouse not found'
        });
      }
    } else if (fromType === 'store') {
      const store = await Store.findByPk(fromId);
      if (!store) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Source store not found'
        });
      }
    }
    
    if (toType === 'warehouse') {
      const warehouse = await Warehouse.findByPk(toId);
      if (!warehouse) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Destination warehouse not found'
        });
      }
    } else if (toType === 'store') {
      const store = await Store.findByPk(toId);
      if (!store) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Destination store not found'
        });
      }
    }
    
    // Generate transfer number
    const transferNumber = `TRF${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Create transfer
    const transfer = await InternalTransfer.create({
      transferNumber,
      fromType,
      fromId,
      toType,
      toId,
      transferReason,
      notes,
      requestedBy,
      status: 'pending'
    }, { transaction: t });
    
    // Create transfer items and validate stock
    let totalValue = 0;
    
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }
      
      // Check stock availability at source
      if (fromType === 'warehouse') {
        const inventory = await WarehouseInventory.findOne({
          where: {
            warehouseId: fromId,
            productId: item.productId
          }
        });
        
        if (!inventory || inventory.quantity < item.quantity) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name} at source warehouse`
          });
        }
      }
      
      const itemValue = item.quantity * (item.unitCost || product.price || 0);
      totalValue += itemValue;
      
      await InternalTransferItem.create({
        transferId: transfer.id,
        productId: item.productId,
        productName: product.name,
        productSKU: product.sku,
        quantity: item.quantity,
        unitCost: item.unitCost || product.price || 0,
        totalValue: itemValue
      }, { transaction: t });
    }
    
    // Update transfer with total value
    transfer.totalValue = totalValue;
    transfer.totalItems = items.length;
    await transfer.save({ transaction: t });
    
    await t.commit();
    
    res.status(201).json({
      success: true,
      data: transfer,
      message: 'Transfer created successfully'
    });
  } catch (error) {
    await t.rollback();
    console.error('Create transfer error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all transfers
// @route   GET /api/internal-transfers
// @access  Private
exports.getTransfers = async (req, res) => {
  try {
    const {
      status,
      fromType,
      toType,
      fromId,
      toId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;
    
    const where = {};
    
    if (status) where.status = status;
    if (fromType) where.fromType = fromType;
    if (toType) where.toType = toType;
    if (fromId) where.fromId = fromId;
    if (toId) where.toId = toId;
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await InternalTransfer.findAndCountAll({
      where,
      include: [
        {
          model: InternalTransferItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single transfer
// @route   GET /api/internal-transfers/:id
// @access  Private
exports.getTransfer = async (req, res) => {
  try {
    const transfer = await InternalTransfer.findByPk(req.params.id, {
      include: [
        {
          model: InternalTransferItem,
          as: 'items'
        }
      ]
    });
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }
    
    res.json({
      success: true,
      data: transfer
    });
  } catch (error) {
    console.error('Get transfer error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve transfer
// @route   PUT /api/internal-transfers/:id/approve
// @access  Private (Manager/Admin only)
exports.approveTransfer = async (req, res) => {
  try {
    const { approvedBy } = req.body;
    
    const transfer = await InternalTransfer.findByPk(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }
    
    if (transfer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending transfers can be approved'
      });
    }
    
    transfer.status = 'approved';
    transfer.approvedBy = approvedBy || req.user.id;
    transfer.approvedAt = new Date();
    await transfer.save();
    
    res.json({
      success: true,
      data: transfer,
      message: 'Transfer approved successfully'
    });
  } catch (error) {
    console.error('Approve transfer error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark transfer as shipped
// @route   PUT /api/internal-transfers/:id/ship
// @access  Private
exports.shipTransfer = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { shippedBy, trackingNumber, carrier } = req.body;
    
    const transfer = await InternalTransfer.findByPk(req.params.id, {
      include: [
        {
          model: InternalTransferItem,
          as: 'items'
        }
      ]
    });
    
    if (!transfer) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }
    
    if (transfer.status !== 'approved') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only approved transfers can be shipped'
      });
    }
    
    // Deduct stock from source if warehouse
    if (transfer.fromType === 'warehouse') {
      for (const item of transfer.items) {
        const inventory = await WarehouseInventory.findOne({
          where: {
            warehouseId: transfer.fromId,
            productId: item.productId
          }
        });
        
        if (!inventory || inventory.quantity < item.quantity) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.productName}`
          });
        }
        
        inventory.quantity -= item.quantity;
        inventory.reservedQuantity -= item.quantity;
        await inventory.save({ transaction: t });
      }
    }
    
    transfer.status = 'in_transit';
    transfer.shippedBy = shippedBy || req.user.id;
    transfer.shippedAt = new Date();
    transfer.trackingNumber = trackingNumber;
    transfer.carrier = carrier;
    await transfer.save({ transaction: t });
    
    await t.commit();
    
    res.json({
      success: true,
      data: transfer,
      message: 'Transfer marked as shipped'
    });
  } catch (error) {
    await t.rollback();
    console.error('Ship transfer error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Receive transfer
// @route   PUT /api/internal-transfers/:id/receive
// @access  Private
exports.receiveTransfer = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { receivedBy, receivedQuantities, notes } = req.body;
    
    const transfer = await InternalTransfer.findByPk(req.params.id, {
      include: [
        {
          model: InternalTransferItem,
          as: 'items'
        }
      ]
    });
    
    if (!transfer) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }
    
    if (transfer.status !== 'in_transit') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only in-transit transfers can be received'
      });
    }
    
    // Add stock to destination if warehouse
    if (transfer.toType === 'warehouse') {
      for (const item of transfer.items) {
        const receivedQty = receivedQuantities?.[item.productId] || item.quantity;
        
        let inventory = await WarehouseInventory.findOne({
          where: {
            warehouseId: transfer.toId,
            productId: item.productId
          }
        });
        
        if (!inventory) {
          inventory = await WarehouseInventory.create({
            warehouseId: transfer.toId,
            productId: item.productId,
            quantity: 0,
            reservedQuantity: 0
          }, { transaction: t });
        }
        
        inventory.quantity += receivedQty;
        await inventory.save({ transaction: t });
        
        // Update item with received quantity
        item.quantityReceived = receivedQty;
        if (receivedQty < item.quantity) {
          item.discrepancyNotes = `Expected: ${item.quantity}, Received: ${receivedQty}`;
        }
        await item.save({ transaction: t });
      }
    }
    
    transfer.status = 'completed';
    transfer.receivedBy = receivedBy || req.user.id;
    transfer.receivedAt = new Date();
    if (notes) transfer.notes = (transfer.notes || '') + '\n' + notes;
    await transfer.save({ transaction: t });
    
    await t.commit();
    
    res.json({
      success: true,
      data: transfer,
      message: 'Transfer received successfully'
    });
  } catch (error) {
    await t.rollback();
    console.error('Receive transfer error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel transfer
// @route   DELETE /api/internal-transfers/:id
// @access  Private
exports.cancelTransfer = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { cancelReason } = req.body;
    
    const transfer = await InternalTransfer.findByPk(req.params.id, {
      include: [
        {
          model: InternalTransferItem,
          as: 'items'
        }
      ]
    });
    
    if (!transfer) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }
    
    if (['completed', 'cancelled'].includes(transfer.status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed or already cancelled transfers'
      });
    }
    
    // If in-transit, need to restore stock
    if (transfer.status === 'in_transit' && transfer.fromType === 'warehouse') {
      for (const item of transfer.items) {
        const inventory = await WarehouseInventory.findOne({
          where: {
            warehouseId: transfer.fromId,
            productId: item.productId
          }
        });
        
        if (inventory) {
          inventory.quantity += item.quantity;
          inventory.reservedQuantity += item.quantity;
          await inventory.save({ transaction: t });
        }
      }
    }
    
    transfer.status = 'cancelled';
    transfer.cancelledBy = req.user.id;
    transfer.cancelledAt = new Date();
    transfer.cancelReason = cancelReason;
    await transfer.save({ transaction: t });
    
    await t.commit();
    
    res.json({
      success: true,
      data: transfer,
      message: 'Transfer cancelled successfully'
    });
  } catch (error) {
    await t.rollback();
    console.error('Cancel transfer error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get transfer statistics
// @route   GET /api/internal-transfers/stats
// @access  Private
exports.getTransferStats = async (req, res) => {
  try {
    const { startDate, endDate, locationId, locationType } = req.query;
    
    const where = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (locationId && locationType) {
      where[Op.or] = [
        { fromId: locationId, fromType: locationType },
        { toId: locationId, toType: locationType }
      ];
    }
    
    // Total transfers by status
    const statusCounts = await InternalTransfer.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalValue')), 'totalValue']
      ],
      group: ['status']
    });
    
    // Total value transferred
    const totalValue = await InternalTransfer.sum('totalValue', {
      where: {
        ...where,
        status: 'completed'
      }
    }) || 0;
    
    // Average processing time
    const avgProcessingTime = await sequelize.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM ("completedAt" - "createdAt"))) / 3600 as "avgHours"
      FROM internal_transfers
      WHERE status = 'completed'
        ${startDate && endDate ? `AND "createdAt" BETWEEN :startDate AND :endDate` : ''}
    `, {
      replacements: { startDate: new Date(startDate), endDate: new Date(endDate) },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      data: {
        statusCounts,
        totalValueTransferred: parseFloat(totalValue).toFixed(2),
        averageProcessingHours: avgProcessingTime[0]?.avgHours?.toFixed(2) || 0
      }
    });
  } catch (error) {
    console.error('Get transfer stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
