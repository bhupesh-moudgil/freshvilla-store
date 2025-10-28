const { Op } = require('sequelize');
const CreditNote = require('../models/CreditNote');
const Order = require('../models/Order');
const InternalInvoice = require('../models/InternalInvoice');
const Store = require('../models/Store');
const Customer = require('../models/Customer');
const sequelize = require('../config/database');

// @desc    Create credit note
// @route   POST /api/credit-notes
// @access  Private (Admin/Manager)
exports.createCreditNote = async (req, res) => {
  try {
    const {
      creditNoteType,
      referenceType,
      referenceId,
      referenceNumber,
      storeId,
      customerId,
      reason,
      amount,
      taxAmount,
      totalAmount,
      items,
      notes
    } = req.body;
    
    // Validate reference
    if (referenceType === 'order') {
      const order = await Order.findByPk(referenceId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    } else if (referenceType === 'invoice') {
      const invoice = await InternalInvoice.findByPk(referenceId);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }
    }
    
    // Generate credit note number
    const creditNoteNumber = `CN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const creditNote = await CreditNote.create({
      creditNoteNumber,
      creditNoteType,
      referenceType,
      referenceId,
      referenceNumber,
      storeId,
      customerId,
      reason,
      amount,
      taxAmount,
      totalAmount,
      items: items || [],
      notes,
      status: 'pending',
      issuedBy: req.user?.id,
      issuedAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: creditNote,
      message: 'Credit note created successfully'
    });
  } catch (error) {
    console.error('Create credit note error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all credit notes
// @route   GET /api/credit-notes
// @access  Private
exports.getCreditNotes = async (req, res) => {
  try {
    const {
      status,
      creditNoteType,
      storeId,
      customerId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;
    
    const where = {};
    
    if (status) where.status = status;
    if (creditNoteType) where.creditNoteType = creditNoteType;
    if (storeId) where.storeId = storeId;
    if (customerId) where.customerId = customerId;
    
    if (startDate && endDate) {
      where.issuedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await CreditNote.findAndCountAll({
      where,
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'storeNumber']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['issuedAt', 'DESC']],
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
    console.error('Get credit notes error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single credit note
// @route   GET /api/credit-notes/:id
// @access  Private
exports.getCreditNote = async (req, res) => {
  try {
    const creditNote = await CreditNote.findByPk(req.params.id, {
      include: [
        {
          model: Store,
          as: 'store'
        },
        {
          model: Customer,
          as: 'customer',
          required: false
        }
      ]
    });
    
    if (!creditNote) {
      return res.status(404).json({
        success: false,
        message: 'Credit note not found'
      });
    }
    
    res.json({
      success: true,
      data: creditNote
    });
  } catch (error) {
    console.error('Get credit note error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve credit note
// @route   PUT /api/credit-notes/:id/approve
// @access  Private (Admin/Manager)
exports.approveCreditNote = async (req, res) => {
  try {
    const { approvalNotes } = req.body;
    
    const creditNote = await CreditNote.findByPk(req.params.id);
    
    if (!creditNote) {
      return res.status(404).json({
        success: false,
        message: 'Credit note not found'
      });
    }
    
    if (creditNote.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending credit notes can be approved'
      });
    }
    
    creditNote.status = 'approved';
    creditNote.approvedBy = req.user?.id;
    creditNote.approvedAt = new Date();
    
    if (approvalNotes) {
      creditNote.notes = (creditNote.notes || '') + '\nApproval: ' + approvalNotes;
    }
    
    await creditNote.save();
    
    res.json({
      success: true,
      data: creditNote,
      message: 'Credit note approved successfully'
    });
  } catch (error) {
    console.error('Approve credit note error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Apply credit note
// @route   PUT /api/credit-notes/:id/apply
// @access  Private (Admin/Manager)
exports.applyCreditNote = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { applyToReferenceId, applyToReferenceType, appliedAmount } = req.body;
    
    const creditNote = await CreditNote.findByPk(req.params.id);
    
    if (!creditNote) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Credit note not found'
      });
    }
    
    if (creditNote.status !== 'approved') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only approved credit notes can be applied'
      });
    }
    
    const amountToApply = appliedAmount || parseFloat(creditNote.totalAmount);
    const newAppliedAmount = parseFloat(creditNote.appliedAmount) + amountToApply;
    
    if (newAppliedAmount > parseFloat(creditNote.totalAmount)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Applied amount exceeds credit note total'
      });
    }
    
    // Update credit note
    creditNote.appliedAmount = newAppliedAmount;
    creditNote.appliedToReferenceId = applyToReferenceId;
    creditNote.appliedToReferenceType = applyToReferenceType;
    creditNote.appliedAt = new Date();
    creditNote.appliedBy = req.user?.id;
    
    if (newAppliedAmount >= parseFloat(creditNote.totalAmount)) {
      creditNote.status = 'applied';
    }
    
    await creditNote.save({ transaction: t });
    
    await t.commit();
    
    res.json({
      success: true,
      data: {
        creditNote,
        appliedAmount: amountToApply,
        remainingAmount: parseFloat(creditNote.totalAmount) - newAppliedAmount
      },
      message: 'Credit note applied successfully'
    });
  } catch (error) {
    await t.rollback();
    console.error('Apply credit note error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Void credit note
// @route   DELETE /api/credit-notes/:id
// @access  Private (Admin only)
exports.voidCreditNote = async (req, res) => {
  try {
    const { voidReason } = req.body;
    
    const creditNote = await CreditNote.findByPk(req.params.id);
    
    if (!creditNote) {
      return res.status(404).json({
        success: false,
        message: 'Credit note not found'
      });
    }
    
    if (creditNote.status === 'applied') {
      return res.status(400).json({
        success: false,
        message: 'Cannot void an applied credit note'
      });
    }
    
    if (creditNote.status === 'void') {
      return res.status(400).json({
        success: false,
        message: 'Credit note is already void'
      });
    }
    
    creditNote.status = 'void';
    creditNote.voidedBy = req.user?.id;
    creditNote.voidedAt = new Date();
    creditNote.voidReason = voidReason;
    await creditNote.save();
    
    res.json({
      success: true,
      data: creditNote,
      message: 'Credit note voided successfully'
    });
  } catch (error) {
    console.error('Void credit note error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get credit note statistics
// @route   GET /api/credit-notes/stats
// @access  Private (Admin only)
exports.getCreditNoteStats = async (req, res) => {
  try {
    const { startDate, endDate, storeId } = req.query;
    
    const where = {};
    
    if (startDate && endDate) {
      where.issuedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (storeId) where.storeId = storeId;
    
    // Total by status
    const statusCounts = await CreditNote.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('appliedAmount')), 'appliedAmount']
      ],
      group: ['status']
    });
    
    // Total by type
    const typeCounts = await CreditNote.findAll({
      where,
      attributes: [
        'creditNoteType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount']
      ],
      group: ['creditNoteType']
    });
    
    // Total amounts
    const totalIssued = await CreditNote.sum('totalAmount', { where }) || 0;
    const totalApplied = await CreditNote.sum('appliedAmount', { where }) || 0;
    
    res.json({
      success: true,
      data: {
        statusCounts,
        typeCounts,
        totals: {
          issued: parseFloat(totalIssued).toFixed(2),
          applied: parseFloat(totalApplied).toFixed(2),
          pending: (totalIssued - totalApplied).toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Get credit note stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
