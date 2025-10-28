const { Op } = require('sequelize');
const InternalInvoice = require('../models/InternalInvoice');
const InternalInvoiceItem = require('../models/InternalInvoiceItem');
const Store = require('../models/Store');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const sequelize = require('../config/database');

// Helper: Get current financial year
const getFinancialYear = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  if (currentMonth >= 4) {
    // April onwards: FY is current year to next year
    return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  } else {
    // Jan-March: FY is previous year to current year
    return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
  }
};

// Helper: Generate invoice number
const generateInvoiceNumber = async (financialYear, issuerType, transaction) => {
  // Get count of invoices in this FY for this issuer type
  const count = await InternalInvoice.count({
    where: {
      financialYear,
      issuerType
    },
    transaction
  });
  
  const sequence = (count + 1).toString().padStart(4, '0');
  const prefix = issuerType === 'warehouse' ? 'WH' : 'ST';
  
  return `INV-INT-${financialYear}-${prefix}-${sequence}`;
};

// @desc    Create internal invoice
// @route   POST /api/internal-invoices
// @access  Private (Admin/Manager)
exports.createInvoice = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const {
      fromType,
      fromId,
      toType,
      toId,
      items,
      invoiceType,
      dueDate,
      notes,
      relatedTransferId
    } = req.body;
    
    // Validate locations
    if (fromType === 'warehouse') {
      const warehouse = await Warehouse.findByPk(fromId);
      if (!warehouse) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Billing warehouse not found'
        });
      }
    } else if (fromType === 'store') {
      const store = await Store.findByPk(fromId);
      if (!store) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Billing store not found'
        });
      }
    }
    
    if (toType === 'warehouse') {
      const warehouse = await Warehouse.findByPk(toId);
      if (!warehouse) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Recipient warehouse not found'
        });
      }
    } else if (toType === 'store') {
      const store = await Store.findByPk(toId);
      if (!store) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Recipient store not found'
        });
      }
    }
    
    // Generate invoice number
    const invoiceNumber = `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Calculate amounts
    let subtotal = 0;
    
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }
      
      const itemAmount = item.quantity * item.unitPrice;
      subtotal += itemAmount;
    }
    
    // Calculate tax (assuming 18% GST for internal transactions)
    const taxRate = req.body.taxRate || 18;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    
    // Create invoice
    const invoice = await InternalInvoice.create({
      invoiceNumber,
      fromType,
      fromId,
      toType,
      toId,
      invoiceType,
      invoiceDate: new Date(),
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: 'pending',
      notes,
      relatedTransferId,
      createdBy: req.user?.id
    }, { transaction: t });
    
    // Create invoice items
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      const itemAmount = item.quantity * item.unitPrice;
      const itemTax = (itemAmount * taxRate) / 100;
      
      await InternalInvoiceItem.create({
        invoiceId: invoice.id,
        productId: item.productId,
        productName: product.name,
        productSKU: product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate,
        taxAmount: itemTax,
        totalAmount: itemAmount + itemTax,
        description: item.description
      }, { transaction: t });
    }
    
    await t.commit();
    
    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Internal invoice created successfully'
    });
  } catch (error) {
    await t.rollback();
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all internal invoices
// @route   GET /api/internal-invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const {
      status,
      invoiceType,
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
    if (invoiceType) where.invoiceType = invoiceType;
    if (fromType) where.fromType = fromType;
    if (toType) where.toType = toType;
    if (fromId) where.fromId = fromId;
    if (toId) where.toId = toId;
    
    if (startDate && endDate) {
      where.invoiceDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await InternalInvoice.findAndCountAll({
      where,
      include: [
        {
          model: InternalInvoiceItem,
          as: 'items'
        }
      ],
      order: [['invoiceDate', 'DESC']],
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
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single internal invoice
// @route   GET /api/internal-invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await InternalInvoice.findByPk(req.params.id, {
      include: [
        {
          model: InternalInvoiceItem,
          as: 'items'
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Record payment for invoice
// @route   PUT /api/internal-invoices/:id/pay
// @access  Private (Admin/Manager)
exports.recordPayment = async (req, res) => {
  try {
    const {
      paymentAmount,
      paymentMethod,
      paymentReference,
      paymentDate,
      notes
    } = req.body;
    
    const invoice = await InternalInvoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is already paid'
      });
    }
    
    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay a cancelled invoice'
      });
    }
    
    const amountPaid = parseFloat(paymentAmount);
    const newPaidAmount = parseFloat(invoice.paidAmount) + amountPaid;
    const remainingAmount = parseFloat(invoice.totalAmount) - newPaidAmount;
    
    invoice.paidAmount = newPaidAmount;
    
    if (remainingAmount <= 0.01) { // Account for floating point precision
      invoice.status = 'paid';
      invoice.paidAt = paymentDate || new Date();
    } else if (newPaidAmount > 0) {
      invoice.status = 'partial';
    }
    
    invoice.paymentMethod = paymentMethod;
    invoice.paymentReference = paymentReference;
    
    if (notes) {
      invoice.notes = (invoice.notes || '') + '\n' + notes;
    }
    
    await invoice.save();
    
    res.json({
      success: true,
      data: {
        invoice,
        paidAmount: amountPaid,
        totalPaid: newPaidAmount,
        remainingAmount: Math.max(0, remainingAmount)
      },
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel invoice
// @route   DELETE /api/internal-invoices/:id
// @access  Private (Admin only)
exports.cancelInvoice = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    
    const invoice = await InternalInvoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a paid invoice. Please create a credit note instead.'
      });
    }
    
    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is already cancelled'
      });
    }
    
    invoice.status = 'cancelled';
    invoice.cancelledBy = req.user?.id;
    invoice.cancelledAt = new Date();
    invoice.cancelReason = cancelReason;
    await invoice.save();
    
    res.json({
      success: true,
      data: invoice,
      message: 'Invoice cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get pending invoices
// @route   GET /api/internal-invoices/pending
// @access  Private
exports.getPendingInvoices = async (req, res) => {
  try {
    const { locationId, locationType } = req.query;
    
    const where = {
      status: ['pending', 'partial']
    };
    
    if (locationId && locationType) {
      where.toId = locationId;
      where.toType = locationType;
    }
    
    const invoices = await InternalInvoice.findAll({
      where,
      include: [
        {
          model: InternalInvoiceItem,
          as: 'items'
        }
      ],
      order: [['dueDate', 'ASC']]
    });
    
    // Calculate aging
    const now = new Date();
    const invoicesWithAging = invoices.map(invoice => {
      const dueDate = new Date(invoice.dueDate);
      const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
      const remainingAmount = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount);
      
      return {
        ...invoice.toJSON(),
        daysOverdue: Math.max(0, daysOverdue),
        isOverdue: daysOverdue > 0,
        remainingAmount: remainingAmount.toFixed(2)
      };
    });
    
    res.json({
      success: true,
      data: invoicesWithAging
    });
  } catch (error) {
    console.error('Get pending invoices error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get invoice statistics
// @route   GET /api/internal-invoices/stats
// @access  Private (Admin only)
exports.getInvoiceStats = async (req, res) => {
  try {
    const { startDate, endDate, locationId, locationType } = req.query;
    
    const where = {};
    
    if (startDate && endDate) {
      where.invoiceDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (locationId && locationType) {
      where[Op.or] = [
        { fromId: locationId, fromType: locationType },
        { toId: locationId, toType: locationType }
      ];
    }
    
    // Total invoices by status
    const statusCounts = await InternalInvoice.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('paidAmount')), 'paidAmount']
      ],
      group: ['status']
    });
    
    // Total outstanding
    const outstanding = await InternalInvoice.sum('totalAmount', {
      where: {
        ...where,
        status: ['pending', 'partial']
      }
    }) || 0;
    
    const outstandingPaid = await InternalInvoice.sum('paidAmount', {
      where: {
        ...where,
        status: ['pending', 'partial']
      }
    }) || 0;
    
    // Overdue invoices
    const overdueCount = await InternalInvoice.count({
      where: {
        ...where,
        status: ['pending', 'partial'],
        dueDate: { [Op.lt]: new Date() }
      }
    });
    
    const overdueAmount = await InternalInvoice.sum('totalAmount', {
      where: {
        ...where,
        status: ['pending', 'partial'],
        dueDate: { [Op.lt]: new Date() }
      }
    }) || 0;
    
    const overduePaid = await InternalInvoice.sum('paidAmount', {
      where: {
        ...where,
        status: ['pending', 'partial'],
        dueDate: { [Op.lt]: new Date() }
      }
    }) || 0;
    
    res.json({
      success: true,
      data: {
        statusCounts,
        outstanding: {
          total: parseFloat(outstanding).toFixed(2),
          paid: parseFloat(outstandingPaid).toFixed(2),
          remaining: (outstanding - outstandingPaid).toFixed(2)
        },
        overdue: {
          count: overdueCount,
          total: parseFloat(overdueAmount).toFixed(2),
          paid: parseFloat(overduePaid).toFixed(2),
          remaining: (overdueAmount - overduePaid).toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/internal-invoices/:id
// @access  Private (Admin only)
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await InternalInvoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a paid invoice'
      });
    }
    
    const allowedFields = ['dueDate', 'notes', 'invoiceType'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    await invoice.update(updates);
    
    res.json({
      success: true,
      data: invoice,
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
