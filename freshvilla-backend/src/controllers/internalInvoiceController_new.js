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

// ... Continue with existing getInvoices, getInvoice, recordPayment, cancelInvoice functions
