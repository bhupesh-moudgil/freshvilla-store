const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate professional internal invoice PDF
 * @param {Object} invoice - Invoice object with items included
 * @param {String} outputPath - Full path where PDF should be saved
 * @returns {Promise<String>} - Path to generated PDF
 */
const generateInvoicePDF = (invoice, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure output directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: 'FreshVilla',
          Subject: 'Internal Invoice',
          Keywords: 'invoice, internal, GST'
        }
      });

      // Pipe to file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Add content
      addHeader(doc, invoice);
      addPartyDetails(doc, invoice);
      addInvoiceInfo(doc, invoice);
      addItemsTable(doc, invoice);
      addTotals(doc, invoice);
      addGSTSummary(doc, invoice);
      addFooter(doc, invoice);

      // Finalize
      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Add header with company logo and title
const addHeader = (doc, invoice) => {
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('FreshVilla', 50, 50)
    .fontSize(10)
    .font('Helvetica')
    .text('Fresh Groceries & More', 50, 80);

  // Invoice title
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('TAX INVOICE', 400, 50, { align: 'right' });

  // Draw horizontal line
  doc
    .moveTo(50, 110)
    .lineTo(545, 110)
    .stroke();
};

// Add issuer and recipient details
const addPartyDetails = (doc, invoice) => {
  let yPos = 130;

  // Issuer (From)
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('From (Issuer):', 50, yPos);

  yPos += 20;
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(invoice.issuerName, 50, yPos);

  yPos += 15;
  doc
    .font('Helvetica')
    .text(invoice.issuerAddress || '', 50, yPos, { width: 220 });

  yPos += getTextHeight(doc, invoice.issuerAddress || '', 220) + 5;
  doc.text(`${invoice.issuerCity}, ${invoice.issuerState} - ${invoice.issuerStateCode}`, 50, yPos);

  yPos += 15;
  if (invoice.issuerGSTIN) {
    doc.text(`GSTIN: ${invoice.issuerGSTIN}`, 50, yPos);
  }

  // Recipient (To)
  yPos = 130;
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('To (Recipient):', 320, yPos);

  yPos += 20;
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(invoice.recipientName, 320, yPos);

  yPos += 15;
  doc
    .font('Helvetica')
    .text(invoice.recipientAddress || '', 320, yPos, { width: 220 });

  yPos += getTextHeight(doc, invoice.recipientAddress || '', 220) + 5;
  doc.text(`${invoice.recipientCity}, ${invoice.recipientState} - ${invoice.recipientStateCode}`, 320, yPos);

  yPos += 15;
  if (invoice.recipientGSTIN) {
    doc.text(`GSTIN: ${invoice.recipientGSTIN}`, 320, yPos);
  }
};

// Add invoice information box
const addInvoiceInfo = (doc, invoice) => {
  const yPos = 270;

  // Draw box
  doc
    .rect(50, yPos, 495, 60)
    .stroke();

  // Left column
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Invoice Number:', 60, yPos + 10)
    .font('Helvetica')
    .text(invoice.invoiceNumber, 160, yPos + 10);

  doc
    .font('Helvetica-Bold')
    .text('Invoice Date:', 60, yPos + 25)
    .font('Helvetica')
    .text(formatDate(invoice.invoiceDate), 160, yPos + 25);

  if (invoice.dueDate) {
    doc
      .font('Helvetica-Bold')
      .text('Due Date:', 60, yPos + 40)
      .font('Helvetica')
      .text(formatDate(invoice.dueDate), 160, yPos + 40);
  }

  // Right column
  doc
    .font('Helvetica-Bold')
    .text('Financial Year:', 320, yPos + 10)
    .font('Helvetica')
    .text(invoice.financialYear, 420, yPos + 10);

  doc
    .font('Helvetica-Bold')
    .text('Transaction Type:', 320, yPos + 25)
    .font('Helvetica')
    .text(invoice.isInterState ? 'Inter-State' : 'Intra-State', 420, yPos + 25);

  doc
    .font('Helvetica-Bold')
    .text('Invoice Type:', 320, yPos + 40)
    .font('Helvetica')
    .text(formatInvoiceType(invoice.invoiceType), 420, yPos + 40);
};

// Add items table
const addItemsTable = (doc, invoice) => {
  const yStart = 360;
  let yPos = yStart;

  // Table headers
  const headers = ['#', 'Item', 'HSN', 'Qty', 'Rate', 'Taxable', 'Tax%', 'Tax Amt', 'Total'];
  const colWidths = [25, 140, 60, 40, 50, 60, 35, 50, 60];
  let xPos = 50;

  doc
    .fontSize(9)
    .font('Helvetica-Bold');

  // Draw header row background
  doc
    .rect(50, yPos, 495, 20)
    .fillAndStroke('#e0e0e0', '#000000');

  doc.fillColor('#000000');

  // Draw headers
  yPos += 6;
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], xPos, yPos, {
      width: colWidths[i],
      align: i === 0 || i === 1 ? 'left' : 'right'
    });
    xPos += colWidths[i];
  }

  yPos += 20;
  doc.font('Helvetica');

  // Draw items
  const items = invoice.items || invoice.InternalInvoiceItems || [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Check if we need a new page
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }

    xPos = 50;
    
    // Line number
    doc.text(`${i + 1}`, xPos, yPos, { width: colWidths[0], align: 'left' });
    xPos += colWidths[0];

    // Item name (truncate if too long)
    const itemName = item.productName.length > 30 
      ? item.productName.substring(0, 27) + '...' 
      : item.productName;
    doc.text(itemName, xPos, yPos, { width: colWidths[1], align: 'left' });
    xPos += colWidths[1];

    // HSN Code
    doc.text(item.hsnCode || '-', xPos, yPos, { width: colWidths[2], align: 'right' });
    xPos += colWidths[2];

    // Quantity
    doc.text(formatNumber(item.quantity), xPos, yPos, { width: colWidths[3], align: 'right' });
    xPos += colWidths[3];

    // Rate
    doc.text(formatCurrency(item.unitPrice), xPos, yPos, { width: colWidths[4], align: 'right' });
    xPos += colWidths[4];

    // Taxable Amount
    doc.text(formatCurrency(item.taxableAmount), xPos, yPos, { width: colWidths[5], align: 'right' });
    xPos += colWidths[5];

    // Tax Rate
    doc.text(`${formatNumber(item.taxRate)}%`, xPos, yPos, { width: colWidths[6], align: 'right' });
    xPos += colWidths[6];

    // Tax Amount
    doc.text(formatCurrency(item.totalTaxAmount), xPos, yPos, { width: colWidths[7], align: 'right' });
    xPos += colWidths[7];

    // Total
    doc.text(formatCurrency(item.itemTotalAmount), xPos, yPos, { width: colWidths[8], align: 'right' });

    yPos += 18;

    // Draw horizontal line
    doc
      .moveTo(50, yPos)
      .lineTo(545, yPos)
      .stroke();
    
    yPos += 2;
  }

  return yPos;
};

// Add totals section
const addTotals = (doc, invoice) => {
  let yPos = doc.y + 10;

  if (yPos > 650) {
    doc.addPage();
    yPos = 50;
  }

  const labelX = 350;
  const valueX = 480;
  const valueWidth = 65;

  doc.fontSize(9);

  // Subtotal
  doc
    .font('Helvetica')
    .text('Subtotal:', labelX, yPos, { align: 'left' })
    .text(formatCurrency(invoice.subtotal), valueX, yPos, { width: valueWidth, align: 'right' });
  yPos += 15;

  // Discount (if any)
  if (parseFloat(invoice.discountAmount) > 0) {
    doc
      .text(`Discount (${invoice.discountType === 'percentage' ? invoice.discountValue + '%' : 'Fixed'}):`, labelX, yPos)
      .text('- ' + formatCurrency(invoice.discountAmount), valueX, yPos, { width: valueWidth, align: 'right' });
    yPos += 15;
  }

  // Taxable Amount
  doc
    .font('Helvetica-Bold')
    .text('Taxable Amount:', labelX, yPos)
    .text(formatCurrency(invoice.taxableAmount), valueX, yPos, { width: valueWidth, align: 'right' });
  yPos += 18;

  doc.font('Helvetica');

  // GST breakdown
  if (invoice.isInterState) {
    doc
      .text(`IGST (${getTaxRateDisplay(invoice)}):`, labelX, yPos)
      .text(formatCurrency(invoice.igst), valueX, yPos, { width: valueWidth, align: 'right' });
    yPos += 15;
  } else {
    doc
      .text(`CGST (${getTaxRateDisplay(invoice, 2)}):`, labelX, yPos)
      .text(formatCurrency(invoice.cgst), valueX, yPos, { width: valueWidth, align: 'right' });
    yPos += 15;

    doc
      .text(`SGST (${getTaxRateDisplay(invoice, 2)}):`, labelX, yPos)
      .text(formatCurrency(invoice.sgst), valueX, yPos, { width: valueWidth, align: 'right' });
    yPos += 15;
  }

  // Additional charges
  const hasAdditionalCharges = parseFloat(invoice.totalAdditionalCharges) > 0;
  if (hasAdditionalCharges) {
    doc
      .text('Additional Charges:', labelX, yPos)
      .text(formatCurrency(invoice.totalAdditionalCharges), valueX, yPos, { width: valueWidth, align: 'right' });
    yPos += 15;
  }

  // Round off
  if (parseFloat(invoice.roundOff) !== 0) {
    doc
      .text('Round Off:', labelX, yPos)
      .text(formatCurrency(invoice.roundOff), valueX, yPos, { width: valueWidth, align: 'right' });
    yPos += 15;
  }

  // Draw line before total
  doc
    .moveTo(labelX, yPos)
    .lineTo(545, yPos)
    .stroke();
  yPos += 5;

  // Total Amount
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Total Amount:', labelX, yPos)
    .text(formatCurrency(invoice.totalAmount), valueX, yPos, { width: valueWidth, align: 'right' });
  
  yPos += 20;

  // Amount in words
  doc
    .fontSize(9)
    .font('Helvetica-Oblique')
    .text(`Amount in words: ${numberToWords(invoice.totalAmount)} Rupees Only`, 50, yPos, {
      width: 495,
      align: 'left'
    });
};

// Add GST summary table
const addGSTSummary = (doc, invoice) => {
  let yPos = doc.y + 20;

  if (yPos > 650) {
    doc.addPage();
    yPos = 50;
  }

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('GST Summary', 50, yPos);

  yPos += 20;

  // Group items by HSN and tax rate
  const gstSummary = {};
  const items = invoice.items || invoice.InternalInvoiceItems || [];

  items.forEach(item => {
    const key = `${item.hsnCode}-${item.taxRate}`;
    if (!gstSummary[key]) {
      gstSummary[key] = {
        hsnCode: item.hsnCode,
        taxRate: item.taxRate,
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0
      };
    }
    gstSummary[key].taxableAmount += parseFloat(item.taxableAmount);
    gstSummary[key].cgst += parseFloat(item.cgstAmount);
    gstSummary[key].sgst += parseFloat(item.sgstAmount);
    gstSummary[key].igst += parseFloat(item.igstAmount);
    gstSummary[key].totalTax += parseFloat(item.totalTaxAmount);
  });

  // Draw table
  const headers = invoice.isInterState 
    ? ['HSN Code', 'Tax Rate', 'Taxable Amount', 'IGST', 'Total Tax']
    : ['HSN Code', 'Tax Rate', 'Taxable Amount', 'CGST', 'SGST', 'Total Tax'];
  
  const colWidths = invoice.isInterState
    ? [100, 80, 120, 100, 100]
    : [80, 60, 100, 80, 80, 100];

  // Header row
  doc.fontSize(8).font('Helvetica-Bold');
  let xPos = 50;
  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos, { width: colWidths[i], align: 'right' });
    xPos += colWidths[i];
  });

  yPos += 15;
  doc.font('Helvetica');

  // Data rows
  Object.values(gstSummary).forEach(row => {
    xPos = 50;
    
    doc.text(row.hsnCode, xPos, yPos, { width: colWidths[0], align: 'left' });
    xPos += colWidths[0];

    doc.text(`${formatNumber(row.taxRate)}%`, xPos, yPos, { width: colWidths[1], align: 'right' });
    xPos += colWidths[1];

    doc.text(formatCurrency(row.taxableAmount), xPos, yPos, { width: colWidths[2], align: 'right' });
    xPos += colWidths[2];

    if (invoice.isInterState) {
      doc.text(formatCurrency(row.igst), xPos, yPos, { width: colWidths[3], align: 'right' });
      xPos += colWidths[3];
    } else {
      doc.text(formatCurrency(row.cgst), xPos, yPos, { width: colWidths[3], align: 'right' });
      xPos += colWidths[3];
      doc.text(formatCurrency(row.sgst), xPos, yPos, { width: colWidths[4], align: 'right' });
      xPos += colWidths[4];
    }

    doc.text(formatCurrency(row.totalTax), xPos, yPos, { width: colWidths[colWidths.length - 1], align: 'right' });

    yPos += 15;
  });
};

// Add footer with terms and signature
const addFooter = (doc, invoice) => {
  let yPos = doc.y + 30;

  if (yPos > 700) {
    doc.addPage();
    yPos = 50;
  }

  // Terms and conditions
  if (invoice.termsAndConditions) {
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('Terms & Conditions:', 50, yPos);
    
    yPos += 12;
    
    doc
      .font('Helvetica')
      .text(invoice.termsAndConditions, 50, yPos, { width: 495, align: 'left' });
    
    yPos = doc.y + 15;
  }

  // Notes
  if (invoice.notes) {
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('Notes:', 50, yPos);
    
    yPos += 12;
    
    doc
      .font('Helvetica')
      .text(invoice.notes, 50, yPos, { width: 495, align: 'left' });
    
    yPos = doc.y + 20;
  }

  // Signature section
  yPos = Math.max(yPos, 700);
  
  doc
    .fontSize(9)
    .font('Helvetica-Oblique')
    .text('This is a computer-generated document and does not require a signature.', 50, yPos, {
      width: 495,
      align: 'center'
    });

  yPos += 20;

  doc
    .fontSize(8)
    .text(`Generated on: ${formatDateTime(new Date())}`, 50, yPos, {
      width: 495,
      align: 'center'
    });
};

// Helper functions
const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount) => {
  return '₹' + parseFloat(amount).toFixed(2);
};

const formatNumber = (num) => {
  return parseFloat(num).toFixed(2);
};

const formatInvoiceType = (type) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getTaxRateDisplay = (invoice, divisor = 1) => {
  const items = invoice.items || invoice.InternalInvoiceItems || [];
  if (items.length === 0) return '0%';
  
  // Get most common tax rate
  const rates = items.map(item => parseFloat(item.taxRate) / divisor);
  const rate = rates[0];
  
  return `${rate.toFixed(2)}%`;
};

const getTextHeight = (doc, text, width) => {
  if (!text) return 0;
  return doc.heightOfString(text, { width });
};

const numberToWords = (num) => {
  // Simplified version - returns just the number for now
  // You can implement full number-to-words conversion
  return Math.round(num).toLocaleString('en-IN');
};

module.exports = {
  generateInvoicePDF
};
