/**
 * ERP Helper Functions
 * Utilities for invoice numbering, GST calculations, and financial operations
 */

const { sequelize } = require('../config/database');

/**
 * Get current financial year (April-March cycle)
 * @returns {string} Financial year in format "2024-25"
 */
function getCurrentFinancialYear() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();
  
  if (currentMonth >= 4) {
    // April onwards - current year to next year
    return `${currentYear}-${String(currentYear + 1).slice(2)}`;
  } else {
    // January to March - previous year to current year
    return `${currentYear - 1}-${String(currentYear).slice(2)}`;
  }
}

/**
 * Get tax period in MMYYYY format
 * @param {Date} date 
 * @returns {string} Tax period
 */
function getTaxPeriod(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}${year}`;
}

/**
 * Generate next invoice number
 * @param {string} prefix - e.g., 'INV-INT', 'CN'
 * @param {string} tableName - Database table name
 * @param {string} columnName - Column to check for sequence
 * @returns {Promise<string>} Next invoice number
 */
async function generateInvoiceNumber(prefix, tableName, columnName = 'invoiceNumber') {
  const fy = getCurrentFinancialYear();
  const pattern = `${prefix}-${fy}-%`;
  
  const result = await sequelize.query(`
    SELECT MAX(CAST(
      SUBSTRING("${columnName}" FROM LENGTH('${prefix}-${fy}-') + 1) AS INTEGER
    )) as max_seq
    FROM ${tableName}
    WHERE "${columnName}" LIKE :pattern
  `, {
    replacements: { pattern },
    type: sequelize.QueryTypes.SELECT
  });
  
  const nextSeq = (result[0]?.max_seq || 0) + 1;
  return `${prefix}-${fy}-${String(nextSeq).padStart(6, '0')}`;
}

/**
 * Generate transfer number
 * @returns {Promise<string>}
 */
async function generateTransferNumber() {
  return generateInvoiceNumber('IT', 'internal_transfers', 'transferNumber');
}

/**
 * Generate internal invoice number
 * @param {string} sourceType - 'W' for warehouse, 'S' for store
 * @returns {Promise<string>}
 */
async function generateInternalInvoiceNumber(sourceType = 'W') {
  const prefix = `INV-INT-${sourceType}`;
  return generateInvoiceNumber(prefix, 'internal_invoices');
}

/**
 * Generate credit note number
 * @returns {Promise<string>}
 */
async function generateCreditNoteNumber() {
  return generateInvoiceNumber('CN', 'credit_notes', 'creditNoteNumber');
}

/**
 * Calculate GST amounts
 * @param {number} amount - Taxable amount
 * @param {number} taxRate - GST rate (0, 5, 12, 18, 28)
 * @param {boolean} isInterState - Whether transaction is interstate
 * @returns {object} GST breakdown
 */
function calculateGST(amount, taxRate, isInterState = false) {
  const taxableAmount = parseFloat(amount);
  const rate = parseFloat(taxRate);
  
  let cgst = 0, sgst = 0, igst = 0;
  
  if (isInterState) {
    igst = (taxableAmount * rate) / 100;
  } else {
    const halfRate = rate / 2;
    cgst = (taxableAmount * halfRate) / 100;
    sgst = (taxableAmount * halfRate) / 100;
  }
  
  const totalTax = cgst + sgst + igst;
  const totalAmount = taxableAmount + totalTax;
  
  return {
    taxableAmount: parseFloat(taxableAmount.toFixed(2)),
    taxRate: rate,
    cgstRate: isInterState ? 0 : rate / 2,
    sgstRate: isInterState ? 0 : rate / 2,
    igstRate: isInterState ? rate : 0,
    cgstAmount: parseFloat(cgst.toFixed(2)),
    sgstAmount: parseFloat(sgst.toFixed(2)),
    igstAmount: parseFloat(igst.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
}

/**
 * Validate GSTIN format
 * @param {string} gstin 
 * @returns {boolean}
 */
function isValidGSTIN(gstin) {
  if (!gstin) return false;
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

/**
 * Extract state code from GSTIN
 * @param {string} gstin 
 * @returns {string}
 */
function getStateCodeFromGSTIN(gstin) {
  if (!isValidGSTIN(gstin)) return null;
  return gstin.substring(0, 2);
}

/**
 * Check if states are different (for interstate transaction)
 * @param {string} gstin1 
 * @param {string} gstin2 
 * @returns {boolean}
 */
function isInterStateTransaction(gstin1, gstin2) {
  if (!gstin1 || !gstin2) return false;
  return getStateCodeFromGSTIN(gstin1) !== getStateCodeFromGSTIN(gstin2);
}

/**
 * Calculate HSN-wise summary from invoice items
 * @param {Array} items - Array of invoice items
 * @returns {Array} HSN-wise summary
 */
function calculateHSNSummary(items) {
  const hsnMap = new Map();
  
  items.forEach(item => {
    const hsn = item.hsnCode;
    if (!hsnMap.has(hsn)) {
      hsnMap.set(hsn, {
        hsnCode: hsn,
        description: item.productName || item.description,
        quantity: 0,
        taxableAmount: 0,
        taxRate: item.taxRate,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalTax: 0,
      });
    }
    
    const summary = hsnMap.get(hsn);
    summary.quantity += parseFloat(item.quantity || 0);
    summary.taxableAmount += parseFloat(item.taxableAmount || 0);
    summary.cgstAmount += parseFloat(item.cgstAmount || 0);
    summary.sgstAmount += parseFloat(item.sgstAmount || 0);
    summary.igstAmount += parseFloat(item.igstAmount || 0);
    summary.totalTax += parseFloat(item.totalTaxAmount || 0);
  });
  
  return Array.from(hsnMap.values()).map(summary => ({
    ...summary,
    quantity: parseFloat(summary.quantity.toFixed(2)),
    taxableAmount: parseFloat(summary.taxableAmount.toFixed(2)),
    cgstAmount: parseFloat(summary.cgstAmount.toFixed(2)),
    sgstAmount: parseFloat(summary.sgstAmount.toFixed(2)),
    igstAmount: parseFloat(summary.igstAmount.toFixed(2)),
    totalTax: parseFloat(summary.totalTax.toFixed(2)),
  }));
}

/**
 * Round to nearest rupee
 * @param {number} amount 
 * @returns {number}
 */
function roundToNearestRupee(amount) {
  return Math.round(parseFloat(amount));
}

/**
 * Calculate round-off amount
 * @param {number} amount 
 * @returns {number}
 */
function calculateRoundOff(amount) {
  const rounded = roundToNearestRupee(amount);
  return parseFloat((rounded - amount).toFixed(2));
}

/**
 * Format amount as Indian currency
 * @param {number} amount 
 * @returns {string}
 */
function formatIndianCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert number to words (Indian style)
 * @param {number} num 
 * @returns {string}
 */
function numberToWords(num) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const b = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const c = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convert = (n) => {
    if (n < 10) return a[n];
    if (n >= 10 && n < 20) return b[n - 10];
    if (n >= 20 && n < 100) return c[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n >= 100 && n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n >= 1000 && n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n >= 100000 && n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    if (n >= 10000000) return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    return '';
  };
  
  const amount = Math.floor(num);
  const paise = Math.round((num - amount) * 100);
  
  let words = convert(amount) + ' Rupees';
  if (paise > 0) {
    words += ' and ' + convert(paise) + ' Paise';
  }
  words += ' Only';
  
  return words;
}

/**
 * Check if e-way bill is required (>50,000 INR)
 * @param {number} amount 
 * @returns {boolean}
 */
function isEWayBillRequired(amount) {
  return parseFloat(amount) > 50000;
}

module.exports = {
  getCurrentFinancialYear,
  getTaxPeriod,
  generateInvoiceNumber,
  generateTransferNumber,
  generateInternalInvoiceNumber,
  generateCreditNoteNumber,
  calculateGST,
  isValidGSTIN,
  getStateCodeFromGSTIN,
  isInterStateTransaction,
  calculateHSNSummary,
  roundToNearestRupee,
  calculateRoundOff,
  formatIndianCurrency,
  numberToWords,
  isEWayBillRequired,
};
