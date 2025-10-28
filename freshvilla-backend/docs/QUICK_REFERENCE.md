# 🚀 GST Invoice System - Quick Reference

## API Endpoints

### Create Invoice
```
POST /api/internal-invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "issuerType": "warehouse|store",
  "issuerId": "uuid",
  "recipientType": "warehouse|store", 
  "recipientId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10,
      "unitPrice": 100.00
    }
  ],
  "transportCharges": 500
}
```

### Issue Invoice (Generate PDF)
```
PUT /api/internal-invoices/:id/issue
Authorization: Bearer {token}
```

### Download PDF
```
GET /api/internal-invoices/:id/download-pdf
Authorization: Bearer {token}
```

### Get Invoice
```
GET /api/internal-invoices/:id
Authorization: Bearer {token}
```

### List Invoices
```
GET /api/internal-invoices?status=draft&page=1&limit=50
Authorization: Bearer {token}
```

---

## GST Rates by Category

| Category | Rate | HSN |
|----------|------|-----|
| Fruits & Vegetables | 0% | 0701 |
| Dairy & Eggs | 5% | 0401 |
| Groceries | 5% | 1001 |
| Snacks & Beverages | 12% | 2202 |
| Bakery | 18% | 1905 |
| Personal Care | 18% | 3304 |
| Household | 18% | 3402 |

---

## Invoice States

```
draft → issued → (paid/cancelled)
```

- **draft**: Editable, no PDF
- **issued**: Immutable, PDF generated
- **paid**: Payment recorded
- **cancelled**: Cannot be paid

---

## GST Calculation Rules

**Intra-State (Same State):**
- CGST = Tax Rate ÷ 2
- SGST = Tax Rate ÷ 2

**Inter-State (Different States):**
- IGST = Tax Rate

---

## Migration Scripts

```bash
# Add GST fields to products
node migrations/add-product-gst-fields.js

# Populate default HSN codes
node migrations/set-default-hsn-gst.js
```

---

## Common Tasks

### Add New Product
```json
POST /api/products
{
  "name": "Product Name",
  "category": "Groceries",
  "price": 100.00,
  "hsnCode": "1001",
  "gstRate": 5,
  "sku": "GRO-00001"
}
```

### Check Database
```sql
SELECT name, sku, "hsnCode", "gstRate" 
FROM products 
LIMIT 10;
```

---

## File Locations

**PDFs:** `/uploads/invoices/pdf/`  
**Migrations:** `/migrations/`  
**Docs:** `/docs/`

---

## Support

📖 Full Documentation: `docs/IMPLEMENTATION_COMPLETE.md`  
📋 Migration Details: `migrations/MIGRATION_SUMMARY.md`  
🔧 Enhancements: `docs/INTERNAL_INVOICE_ENHANCEMENTS.md`
