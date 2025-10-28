# Internal Invoice System - GST & PDF Generation Enhancements

## Overview

The internal invoice system has been significantly enhanced to support comprehensive GST compliance, automatic tax calculations, and professional PDF invoice generation for store-to-store, warehouse-to-store, and warehouse-to-warehouse transactions.

## Key Enhancements

### 1. Product Model Updates
**File:** `src/models/Product.js`

Added GST compliance fields:
- `hsnCode` - HSN/SAC code for GST compliance
- `gstRate` - GST tax rate (0, 5, 12, 18, or 28%)
- `sku` - Stock Keeping Unit

### 2. Enhanced Invoice Creation with Auto GST Calculation
**File:** `src/controllers/internalInvoiceController.js`

#### New Features:
- **Automatic Entity Detail Population**: Automatically fetches and populates issuer and recipient details (name, GSTIN, address, state, city, state code) from Store or Warehouse models
- **Inter-State Detection**: Automatically determines if transaction is inter-state based on state codes
- **Dynamic GST Calculation**: 
  - For **intra-state** transactions: Calculates CGST and SGST (split equally)
  - For **inter-state** transactions: Calculates IGST only
- **Financial Year Management**: Auto-generates financial year (e.g., '2024-25') based on Indian financial year (April-March)
- **Sequential Invoice Numbering**: Format: `INV-INT-{FY}-{WH/ST}-{0001}`
- **Multi-level Discounts**: Supports both item-level and invoice-level discounts
- **Additional Charges**: Transport, handling, packaging, insurance, and other charges
- **Round-off**: Automatic round-off to nearest rupee

#### Request Body Format:
```json
{
  "issuerType": "warehouse",
  "issuerId": "uuid",
  "recipientType": "store",
  "recipientId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10,
      "unitPrice": 100.00,
      "taxRate": 18,
      "discountPercent": 5,
      "batchNumber": "BATCH001",
      "expiryDate": "2025-12-31"
    }
  ],
  "invoiceType": "internal_transfer",
  "dueDate": "2025-01-31",
  "notes": "Delivery before month end",
  "termsAndConditions": "Payment due within 30 days",
  "transportCharges": 500,
  "handlingCharges": 100,
  "discountType": "percentage",
  "discountValue": 2
}
```

### 3. Professional PDF Invoice Generator
**File:** `src/utils/invoicePDFGenerator.js`

#### Features:
- Professional A4 layout with proper margins
- Company branding and logo placeholder
- Complete issuer and recipient details with GSTIN
- Detailed items table with:
  - HSN codes
  - Quantity and unit
  - Rate and taxable amount
  - Individual tax breakdown
  - Line-wise totals
- GST summary table grouped by HSN code and tax rate
- Comprehensive totals section showing:
  - Subtotal
  - Discounts
  - Taxable amount
  - CGST/SGST/IGST breakdown
  - Additional charges
  - Round-off
  - Grand total
- Amount in words
- Terms & conditions
- Notes
- Auto-pagination for long invoices

### 4. New API Endpoints

#### Issue Invoice
```
PUT /api/internal-invoices/:id/issue
```
- Changes status from 'draft' to 'issued'
- Auto-generates PDF
- Records approval timestamp

#### Generate PDF
```
POST /api/internal-invoices/:id/generate-pdf
```
- Generates/regenerates PDF for an invoice
- Updates `pdfPath` and `pdfUrl` fields

#### Download PDF
```
GET /api/internal-invoices/:id/download-pdf
```
- Downloads invoice PDF
- Auto-generates if not exists

## Workflow

### 1. Create Invoice (Draft)
```bash
POST /api/internal-invoices
```
- Invoice created with status 'draft'
- All calculations done automatically
- GST computed based on state codes

### 2. Review & Issue
```bash
PUT /api/internal-invoices/:id/issue
```
- Changes status to 'issued'
- PDF generated automatically
- Invoice becomes immutable (except payment status)

### 3. Download & Share
```bash
GET /api/internal-invoices/:id/download-pdf
```
- Download PDF for printing/sharing

## GST Calculation Logic

### Intra-State (Same State)
```
Taxable Amount = Subtotal - Discount
CGST = Taxable Amount × (GST Rate / 2) %
SGST = Taxable Amount × (GST Rate / 2) %
Total Tax = CGST + SGST
Total Amount = Taxable Amount + Total Tax + Additional Charges ± Round-off
```

### Inter-State (Different States)
```
Taxable Amount = Subtotal - Discount
IGST = Taxable Amount × GST Rate %
Total Tax = IGST
Total Amount = Taxable Amount + Total Tax + Additional Charges ± Round-off
```

## Database Updates Required

### Migration for Product Model:
```sql
ALTER TABLE products 
ADD COLUMN "hsnCode" VARCHAR(20),
ADD COLUMN "gstRate" DECIMAL(5,2) DEFAULT 0,
ADD COLUMN "sku" VARCHAR(50) UNIQUE;

-- Add constraint for GST rate
ALTER TABLE products 
ADD CONSTRAINT check_gst_rate 
CHECK ("gstRate" IN (0, 5, 12, 18, 28));
```

## File Storage

PDF invoices are stored at:
```
/uploads/invoices/pdf/{invoiceNumber}.pdf
```

Accessible via URL:
```
/uploads/invoices/pdf/{invoiceNumber}.pdf
```

## Example Use Cases

### 1. Warehouse to Store Transfer
```javascript
{
  "issuerType": "warehouse",
  "issuerId": "warehouse-uuid",
  "recipientType": "store",
  "recipientId": "store-uuid",
  "items": [...],
  "transportCharges": 1000
}
```

### 2. Store to Store Transfer
```javascript
{
  "issuerType": "store",
  "issuerId": "store-a-uuid",
  "recipientType": "store",
  "recipientId": "store-b-uuid",
  "items": [...]
}
```

### 3. Inter-State Warehouse Transfer
```javascript
{
  "issuerType": "warehouse",
  "issuerId": "warehouse-delhi-uuid",  // Delhi
  "recipientType": "warehouse",
  "recipientId": "warehouse-mumbai-uuid",  // Maharashtra
  "items": [...]
  // Will automatically use IGST
}
```

## Testing Checklist

- [ ] Create invoice with intra-state parties (verify CGST+SGST)
- [ ] Create invoice with inter-state parties (verify IGST)
- [ ] Apply item-level discounts
- [ ] Apply invoice-level discounts
- [ ] Add additional charges
- [ ] Verify round-off calculation
- [ ] Generate and download PDF
- [ ] Issue invoice and verify auto PDF generation
- [ ] Verify invoice numbering sequence
- [ ] Test with multiple HSN codes
- [ ] Test pagination in PDF for many items

## Next Steps

1. ✅ Product model updated with HSN and GST rate
2. ✅ Invoice creation with auto GST calculation
3. ✅ PDF generation utility created
4. ✅ PDF endpoints added
5. ⏳ E-way bill generation for transfers
6. ⏳ Invoice aging and statistics reports
7. ⏳ Email invoice functionality
8. ⏳ Warehouse dashboard integration

## Dependencies

- `pdfkit` - PDF generation (already installed)
- File system access for PDF storage

## Configuration

Ensure the uploads directory exists and is writable:
```bash
mkdir -p uploads/invoices/pdf
chmod 755 uploads/invoices/pdf
```

## Support

For issues or questions regarding the internal invoice system:
- Check invoice status and error messages
- Verify Store/Warehouse has GSTIN and state code
- Verify Products have HSN codes and GST rates
- Check PDF file permissions
