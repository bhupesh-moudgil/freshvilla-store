const { Op } = require('sequelize');
const path = require('path');
const InternalInvoice = require('../models/InternalInvoice');
const InternalInvoiceItem = require('../models/InternalInvoiceItem');
const Store = require('../models/Store');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const sequelize = require('../config/database');
const { generateInvoicePDF } = require('../utils/invoicePDFGenerator');

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

// @desc    Create internal invoice with full GST calculation
// @route   POST /api/internal-invoices
// @access  Private (Admin/Manager)
exports.createInvoice = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const {
      issuerType,
      issuerId,
      recipientType,
      recipientId,
      items,
      invoiceType = 'internal_transfer',
      dueDate,
      notes,
      termsAndConditions,
      transferId,
      transportCharges = 0,
      handlingCharges = 0,
      packagingCharges = 0,
      insuranceCharges = 0,
      otherCharges = 0,
      discountType = 'none',
      discountValue = 0
    } = req.body;
    
    // Validate and fetch issuer details
    let issuer;
    if (issuerType === 'warehouse') {
      issuer = await Warehouse.findByPk(issuerId);
      if (!issuer) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Issuer warehouse not found'
        });
      }
    } else if (issuerType === 'store') {
      issuer = await Store.findByPk(issuerId);
      if (!issuer) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Issuer store not found'
        });
      }
    }
    
    // Validate and fetch recipient details
    let recipient;
    if (recipientType === 'warehouse') {
      recipient = await Warehouse.findByPk(recipientId);
      if (!recipient) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Recipient warehouse not found'
        });
      }
    } else if (recipientType === 'store') {
      recipient = await Store.findByPk(recipientId);
      if (!recipient) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Recipient store not found'
        });
      }
    }
    
    // Extract issuer and recipient information
    const issuerName = issuer.warehouseName || issuer.name;
    const issuerGSTIN = issuer.gstNumber;
    const issuerAddress = issuer.address;
    const issuerCity = issuer.city;
    const issuerState = issuer.state;
    const issuerStateCode = issuer.stateCode;
    
    const recipientName = recipient.warehouseName || recipient.name;
    const recipientGSTIN = recipient.gstNumber;
    const recipientAddress = recipient.address;
    const recipientCity = recipient.city;
    const recipientState = recipient.state;
    const recipientStateCode = recipient.stateCode;
    
    // Determine if inter-state transaction
    const isInterState = issuerStateCode !== recipientStateCode;
    
    // Get financial year and generate invoice number
    const financialYear = getFinancialYear();
    const invoiceNumber = await generateInvoiceNumber(financialYear, issuerType, t);
    
    // Validate items and calculate amounts
    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }
    
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    const invoiceItems = [];
    
    // Process each item
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const product = await Product.findByPk(item.productId);
      
      if (!product) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }
      
      // Validate HSN code
      if (!product.hsnCode) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is missing HSN code`
        });
      }
      
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.unitPrice || product.price);
      const taxRate = parseFloat(item.taxRate || product.gstRate || 0);
      
      // Calculate item subtotal
      const itemSubtotal = quantity * unitPrice;
      
      // Calculate discount if any
      const discountPercent = parseFloat(item.discountPercent || 0);
      const discountAmount = (itemSubtotal * discountPercent) / 100;
      
      // Taxable amount after discount
      const taxableAmount = itemSubtotal - discountAmount;
      
      // Calculate GST
      let cgstRate = 0, sgstRate = 0, igstRate = 0;
      let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
      
      if (isInterState) {
        // Inter-state: Only IGST
        igstRate = taxRate;
        igstAmount = (taxableAmount * igstRate) / 100;
      } else {
        // Intra-state: CGST + SGST (split equally)
        cgstRate = taxRate / 2;
        sgstRate = taxRate / 2;
        cgstAmount = (taxableAmount * cgstRate) / 100;
        sgstAmount = (taxableAmount * sgstRate) / 100;
      }
      
      const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;
      const itemTotalAmount = taxableAmount + totalTaxAmount;
      
      // Accumulate totals
      subtotal += itemSubtotal;
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
      totalIGST += igstAmount;
      
      // Store item data for later creation
      invoiceItems.push({
        productId: product.id,
        productName: product.name,
        productSKU: product.sku,
        hsnCode: product.hsnCode,
        category: product.category,
        description: item.description || product.description,
        quantity,
        unit: item.unit || product.unit || 'piece',
        unitPrice,
        discountPercent,
        discountAmount,
        itemSubtotal,
        taxableAmount,
        taxRate,
        cgstRate,
        sgstRate,
        igstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalTaxAmount,
        itemTotalAmount,
        lineNumber: idx + 1,
        batchNumber: item.batchNumber,
        serialNumber: item.serialNumber,
        manufactureDate: item.manufactureDate,
        expiryDate: item.expiryDate,
        notes: item.notes
      });
    }
    
    // Calculate invoice-level discount
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * parseFloat(discountValue)) / 100;
    } else if (discountType === 'fixed') {
      discountAmount = parseFloat(discountValue);
    }
    
    // Taxable amount after invoice-level discount
    const taxableAmount = subtotal - discountAmount;
    
    // Total tax
    const totalTax = totalCGST + totalSGST + totalIGST;
    
    // Additional charges
    const totalAdditionalCharges = 
      parseFloat(transportCharges) +
      parseFloat(handlingCharges) +
      parseFloat(packagingCharges) +
      parseFloat(insuranceCharges) +
      parseFloat(otherCharges);
    
    // Calculate total amount before round-off
    const amountBeforeRoundOff = taxableAmount + totalTax + totalAdditionalCharges;
    
    // Round-off
    const totalAmount = Math.round(amountBeforeRoundOff);
    const roundOff = totalAmount - amountBeforeRoundOff;
    
    // Create invoice
    const invoice = await InternalInvoice.create({
      invoiceNumber,
      invoiceType,
      financialYear,
      transferId,
      invoiceDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      
      // Issuer details
      issuerType,
      issuerId,
      issuerName,
      issuerGSTIN,
      issuerAddress,
      issuerCity,
      issuerState,
      issuerStateCode,
      
      // Recipient details
      recipientType,
      recipientId,
      recipientName,
      recipientGSTIN,
      recipientAddress,
      recipientCity,
      recipientState,
      recipientStateCode,
      
      // Amounts
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxableAmount,
      
      // GST
      isInterState,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      totalTax,
      
      // Additional charges
      transportCharges: parseFloat(transportCharges),
      handlingCharges: parseFloat(handlingCharges),
      packagingCharges: parseFloat(packagingCharges),
      insuranceCharges: parseFloat(insuranceCharges),
      otherCharges: parseFloat(otherCharges),
      totalAdditionalCharges,
      
      // Total
      roundOff,
      totalAmount,
      
      // Payment
      paymentStatus: 'not_applicable',
      
      // Status
      status: 'draft',
      
      // Notes
      notes,
      termsAndConditions,
      
      createdBy: req.user?.id
    }, { transaction: t });
    
    // Create invoice items
    for (const itemData of invoiceItems) {
      await InternalInvoiceItem.create({
        invoiceId: invoice.id,
        ...itemData
      }, { transaction: t });
    }
    
    await t.commit();
    
    // Fetch complete invoice with items
    const completeInvoice = await InternalInvoice.findByPk(invoice.id, {
      include: [
        {
          model: InternalInvoiceItem,
          as: 'items'
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: completeInvoice,
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

// @desc    Generate PDF for invoice
// @route   POST /api/internal-invoices/:id/generate-pdf
// @access  Private (Admin/Manager)
exports.generatePDF = async (req, res) => {
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
    
    // Generate PDF path
    const pdfDir = path.join(__dirname, '../../uploads/invoices/pdf');
    const pdfFileName = `${invoice.invoiceNumber.replace(/\//g, '-')}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);
    
    // Generate PDF
    await generateInvoicePDF(invoice, pdfPath);
    
    // Update invoice with PDF path
    invoice.pdfPath = pdfPath;
    invoice.pdfUrl = `/uploads/invoices/pdf/${pdfFileName}`;
    await invoice.save();
    
    res.json({
      success: true,
      data: {
        pdfPath: invoice.pdfPath,
        pdfUrl: invoice.pdfUrl
      },
      message: 'PDF generated successfully'
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download invoice PDF
// @route   GET /api/internal-invoices/:id/download-pdf
// @access  Private
exports.downloadPDF = async (req, res) => {
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
    
    // Generate PDF if not exists
    let pdfPath = invoice.pdfPath;
    
    if (!pdfPath || !require('fs').existsSync(pdfPath)) {
      const pdfDir = path.join(__dirname, '../../uploads/invoices/pdf');
      const pdfFileName = `${invoice.invoiceNumber.replace(/\//g, '-')}.pdf`;
      pdfPath = path.join(pdfDir, pdfFileName);
      
      await generateInvoicePDF(invoice, pdfPath);
      
      invoice.pdfPath = pdfPath;
      invoice.pdfUrl = `/uploads/invoices/pdf/${pdfFileName}`;
      await invoice.save();
    }
    
    // Send file
    res.download(pdfPath, `Invoice-${invoice.invoiceNumber}.pdf`, (err) => {
      if (err) {
        console.error('PDF download error:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading PDF'
        });
      }
    });
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Issue/Finalize invoice (changes status to issued and generates PDF)
// @route   PUT /api/internal-invoices/:id/issue
// @access  Private (Admin/Manager)
exports.issueInvoice = async (req, res) => {
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
    
    if (invoice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft invoices can be issued'
      });
    }
    
    // Update status to issued
    invoice.status = 'issued';
    invoice.approvedBy = req.user?.id;
    invoice.approvedAt = new Date();
    
    // Generate PDF automatically
    const pdfDir = path.join(__dirname, '../../uploads/invoices/pdf');
    const pdfFileName = `${invoice.invoiceNumber.replace(/\//g, '-')}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);
    
    await generateInvoicePDF(invoice, pdfPath);
    
    invoice.pdfPath = pdfPath;
    invoice.pdfUrl = `/uploads/invoices/pdf/${pdfFileName}`;
    
    await invoice.save();
    
    res.json({
      success: true,
      data: invoice,
      message: 'Invoice issued successfully'
    });
  } catch (error) {
    console.error('Issue invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
