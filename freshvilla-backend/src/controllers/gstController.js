const { Op } = require('sequelize');
const GSTLedger = require('../models/GSTLedger');
const GSTSummary = require('../models/GSTSummary');
const Store = require('../models/Store');
const Order = require('../models/Order');
const sequelize = require('../config/database');

// @desc    Get GST ledger entries
// @route   GET /api/gst/ledger
// @access  Private (Admin only)
exports.getGSTLedger = async (req, res) => {
  try {
    const {
      storeId,
      transactionType,
      startDate,
      endDate,
      page = 1,
      limit = 100
    } = req.query;
    
    const where = {};
    
    if (storeId) where.storeId = storeId;
    if (transactionType) where.transactionType = transactionType;
    
    if (startDate && endDate) {
      where.transactionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await GSTLedger.findAndCountAll({
      where,
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    // Calculate totals
    const totals = {
      cgst: rows.reduce((sum, r) => sum + parseFloat(r.cgstAmount || 0), 0),
      sgst: rows.reduce((sum, r) => sum + parseFloat(r.sgstAmount || 0), 0),
      igst: rows.reduce((sum, r) => sum + parseFloat(r.igstAmount || 0), 0),
      total: rows.reduce((sum, r) => sum + parseFloat(r.totalGSTAmount || 0), 0)
    };
    
    res.json({
      success: true,
      data: rows,
      totals,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get GST ledger error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get GST summary for specific month/year
// @route   GET /api/gst/summary/:month/:year
// @access  Private (Admin only)
exports.getGSTSummary = async (req, res) => {
  try {
    const { month, year } = req.params;
    const { storeId } = req.query;
    
    const where = {
      month: parseInt(month),
      year: parseInt(year)
    };
    
    if (storeId) {
      where.storeId = storeId;
    }
    
    const summaries = await GSTSummary.findAll({
      where,
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'storeNumber', 'gstNumber']
        }
      ]
    });
    
    if (!summaries || summaries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No GST summary found for this period. Please generate summary first.'
      });
    }
    
    // Calculate grand totals if multiple stores
    const grandTotals = summaries.reduce((acc, s) => ({
      outputCGST: acc.outputCGST + parseFloat(s.outputCGST || 0),
      outputSGST: acc.outputSGST + parseFloat(s.outputSGST || 0),
      outputIGST: acc.outputIGST + parseFloat(s.outputIGST || 0),
      inputCGST: acc.inputCGST + parseFloat(s.inputCGST || 0),
      inputSGST: acc.inputSGST + parseFloat(s.inputSGST || 0),
      inputIGST: acc.inputIGST + parseFloat(s.inputIGST || 0),
      netCGST: acc.netCGST + parseFloat(s.netCGST || 0),
      netSGST: acc.netSGST + parseFloat(s.netSGST || 0),
      netIGST: acc.netIGST + parseFloat(s.netIGST || 0),
      totalGSTLiability: acc.totalGSTLiability + parseFloat(s.totalGSTLiability || 0)
    }), {
      outputCGST: 0,
      outputSGST: 0,
      outputIGST: 0,
      inputCGST: 0,
      inputSGST: 0,
      inputIGST: 0,
      netCGST: 0,
      netSGST: 0,
      netIGST: 0,
      totalGSTLiability: 0
    });
    
    res.json({
      success: true,
      data: {
        summaries,
        grandTotals
      }
    });
  } catch (error) {
    console.error('Get GST summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate GST summary for a period
// @route   POST /api/gst/summary/generate
// @access  Private (Admin only)
exports.generateGSTSummary = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { month, year, storeId } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }
    
    // Get date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    // Get stores to process
    const storeWhere = storeId ? { id: storeId } : {};
    const stores = await Store.findAll({ where: storeWhere });
    
    const generatedSummaries = [];
    
    for (const store of stores) {
      // Check if summary already exists
      const existing = await GSTSummary.findOne({
        where: {
          storeId: store.id,
          month: parseInt(month),
          year: parseInt(year)
        }
      });
      
      if (existing) {
        await existing.destroy({ transaction: t });
      }
      
      // Calculate output GST (sales)
      const outputGST = await GSTLedger.sum('totalGSTAmount', {
        where: {
          storeId: store.id,
          transactionType: 'output',
          transactionDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;
      
      const outputCGST = await GSTLedger.sum('cgstAmount', {
        where: {
          storeId: store.id,
          transactionType: 'output',
          transactionDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;
      
      const outputSGST = await GSTLedger.sum('sgstAmount', {
        where: {
          storeId: store.id,
          transactionType: 'output',
          transactionDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;
      
      const outputIGST = await GSTLedger.sum('igstAmount', {
        where: {
          storeId: store.id,
          transactionType: 'output',
          transactionDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;
      
      // Calculate input GST (purchases)
      const inputGST = await GSTLedger.sum('totalGSTAmount', {
        where: {
          storeId: store.id,
          transactionType: 'input',
          transactionDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;
      
      const inputCGST = await GSTLedger.sum('cgstAmount', {
        where: {
          storeId: store.id,
          transactionType: 'input',
          transactionDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;
      
      const inputSGST = await GSTLedger.sum('sgstAmount', {
        where: {
          storeId: store.id,
          transactionType: 'input',
          transactionDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;
      
      const inputIGST = await GSTLedger.sum('igstAmount', {
        where: {
          storeId: store.id,
          transactionType: 'input',
          transactionDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      }) || 0;
      
      // Calculate net GST liability
      const netCGST = outputCGST - inputCGST;
      const netSGST = outputSGST - inputSGST;
      const netIGST = outputIGST - inputIGST;
      const totalGSTLiability = netCGST + netSGST + netIGST;
      
      // Get transaction counts
      const outputTransactions = await GSTLedger.count({
        where: {
          storeId: store.id,
          transactionType: 'output',
          transactionDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      const inputTransactions = await GSTLedger.count({
        where: {
          storeId: store.id,
          transactionType: 'input',
          transactionDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      // Create summary
      const summary = await GSTSummary.create({
        storeId: store.id,
        month: parseInt(month),
        year: parseInt(year),
        outputCGST,
        outputSGST,
        outputIGST,
        totalOutputGST: outputGST,
        inputCGST,
        inputSGST,
        inputIGST,
        totalInputGST: inputGST,
        netCGST,
        netSGST,
        netIGST,
        totalGSTLiability,
        outputTransactionCount: outputTransactions,
        inputTransactionCount: inputTransactions,
        status: 'draft',
        generatedBy: req.user?.id,
        generatedAt: new Date()
      }, { transaction: t });
      
      generatedSummaries.push(summary);
    }
    
    await t.commit();
    
    res.json({
      success: true,
      data: generatedSummaries,
      message: 'GST summary generated successfully'
    });
  } catch (error) {
    await t.rollback();
    console.error('Generate GST summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get GSTR-1 report data
// @route   GET /api/gst/report/gstr1
// @access  Private (Admin only)
exports.getGSTR1Report = async (req, res) => {
  try {
    const { month, year, storeId } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const where = {
      transactionType: 'output',
      transactionDate: {
        [Op.between]: [startDate, endDate]
      }
    };
    
    if (storeId) where.storeId = storeId;
    
    // Get all output GST transactions (sales)
    const transactions = await GSTLedger.findAll({
      where,
      order: [['transactionDate', 'ASC']]
    });
    
    // Group by GST rate
    const groupedByRate = transactions.reduce((acc, txn) => {
      const rate = parseFloat(txn.gstRate);
      if (!acc[rate]) {
        acc[rate] = {
          gstRate: rate,
          transactions: [],
          totalTaxableValue: 0,
          totalCGST: 0,
          totalSGST: 0,
          totalIGST: 0,
          totalGST: 0
        };
      }
      
      acc[rate].transactions.push(txn);
      acc[rate].totalTaxableValue += parseFloat(txn.taxableAmount);
      acc[rate].totalCGST += parseFloat(txn.cgstAmount || 0);
      acc[rate].totalSGST += parseFloat(txn.sgstAmount || 0);
      acc[rate].totalIGST += parseFloat(txn.igstAmount || 0);
      acc[rate].totalGST += parseFloat(txn.totalGSTAmount);
      
      return acc;
    }, {});
    
    const summaryByRate = Object.values(groupedByRate).map(group => ({
      gstRate: group.gstRate,
      transactionCount: group.transactions.length,
      totalTaxableValue: group.totalTaxableValue.toFixed(2),
      totalCGST: group.totalCGST.toFixed(2),
      totalSGST: group.totalSGST.toFixed(2),
      totalIGST: group.totalIGST.toFixed(2),
      totalGST: group.totalGST.toFixed(2)
    }));
    
    res.json({
      success: true,
      data: {
        period: { month: parseInt(month), year: parseInt(year) },
        summaryByRate,
        transactions
      }
    });
  } catch (error) {
    console.error('Get GSTR-1 report error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get GSTR-3B report data
// @route   GET /api/gst/report/gstr3b
// @access  Private (Admin only)
exports.getGSTR3BReport = async (req, res) => {
  try {
    const { month, year, storeId } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }
    
    const summary = await GSTSummary.findOne({
      where: {
        month: parseInt(month),
        year: parseInt(year),
        ...(storeId && { storeId })
      },
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'gstNumber']
        }
      ]
    });
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'GST summary not found. Please generate summary first.'
      });
    }
    
    // GSTR-3B format
    const gstr3b = {
      gstin: summary.store?.gstNumber,
      period: {
        month: parseInt(month),
        year: parseInt(year)
      },
      outwardSupplies: {
        taxableValue: parseFloat(summary.outputTaxableAmount || 0).toFixed(2),
        cgst: parseFloat(summary.outputCGST).toFixed(2),
        sgst: parseFloat(summary.outputSGST).toFixed(2),
        igst: parseFloat(summary.outputIGST).toFixed(2),
        totalTax: parseFloat(summary.totalOutputGST).toFixed(2)
      },
      inwardSupplies: {
        taxableValue: parseFloat(summary.inputTaxableAmount || 0).toFixed(2),
        cgst: parseFloat(summary.inputCGST).toFixed(2),
        sgst: parseFloat(summary.inputSGST).toFixed(2),
        igst: parseFloat(summary.inputIGST).toFixed(2),
        totalTax: parseFloat(summary.totalInputGST).toFixed(2)
      },
      netGST: {
        cgst: parseFloat(summary.netCGST).toFixed(2),
        sgst: parseFloat(summary.netSGST).toFixed(2),
        igst: parseFloat(summary.netIGST).toFixed(2),
        totalLiability: parseFloat(summary.totalGSTLiability).toFixed(2)
      },
      transactionCounts: {
        outputTransactions: summary.outputTransactionCount,
        inputTransactions: summary.inputTransactionCount
      },
      status: summary.status,
      filedAt: summary.filedAt
    };
    
    res.json({
      success: true,
      data: gstr3b
    });
  } catch (error) {
    console.error('Get GSTR-3B report error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get store-wise GST summary
// @route   GET /api/gst/store/:storeId/summary
// @access  Private
exports.getStoreGSTSummary = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { startDate, endDate } = req.query;
    
    const where = { storeId };
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      where.year = {
        [Op.gte]: start.getFullYear(),
        [Op.lte]: end.getFullYear()
      };
    }
    
    const summaries = await GSTSummary.findAll({
      where,
      order: [['year', 'DESC'], ['month', 'DESC']]
    });
    
    // Calculate totals
    const totals = summaries.reduce((acc, s) => ({
      totalOutputGST: acc.totalOutputGST + parseFloat(s.totalOutputGST || 0),
      totalInputGST: acc.totalInputGST + parseFloat(s.totalInputGST || 0),
      totalLiability: acc.totalLiability + parseFloat(s.totalGSTLiability || 0)
    }), {
      totalOutputGST: 0,
      totalInputGST: 0,
      totalLiability: 0
    });
    
    res.json({
      success: true,
      data: {
        summaries,
        totals
      }
    });
  } catch (error) {
    console.error('Get store GST summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark GST summary as filed
// @route   PUT /api/gst/summary/:id/file
// @access  Private (Admin only)
exports.fileGSTReturn = async (req, res) => {
  try {
    const { filingReference, filedDate } = req.body;
    
    const summary = await GSTSummary.findByPk(req.params.id);
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'GST summary not found'
      });
    }
    
    summary.status = 'filed';
    summary.filedAt = filedDate || new Date();
    summary.filingReference = filingReference;
    summary.filedBy = req.user?.id;
    await summary.save();
    
    res.json({
      success: true,
      data: summary,
      message: 'GST return marked as filed'
    });
  } catch (error) {
    console.error('File GST return error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
