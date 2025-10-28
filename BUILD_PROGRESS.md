# 🏗️ FreshVilla Warehouse & Internal Invoicing System - Build Progress

## ✅ **Completed Models** (4/12)

### 1. **Warehouse Model** ✅
- **File**: `src/models/Warehouse.js`
- **Features**:
  - Warehouse code, name, type (main/regional/satellite)
  - Location with lat/long
  - GST, PAN, TAN numbers
  - Capacity tracking (sqft, storage units)
  - Operating hours, serving states/cities
  - Status management
  - Instance methods: `calculateAvailableCapacity()`, `isOperational()`

### 2. **WarehouseInventory Model** ✅
- **File**: `src/models/WarehouseInventory.js`
- **Features**:
  - Stock levels (current, minimum, maximum, reorder point)
  - Pricing (cost, transfer price)
  - Warehouse location (rack, bin, aisle)
  - Batch tracking (batch number, manufacture/expiry dates)
  - Stock status (available, reserved, damaged)
  - Instance methods: `isStockLow()`, `needsReorder()`, `reserveStock()`, `releaseReservedStock()`

### 3. **InternalTransfer Model** ✅
- **File**: `src/models/InternalTransfer.js`
- **Features**:
  - Transfer types: W→S, S→W, S→S, W→W
  - Source/destination tracking (polymorphic)
  - Transfer workflow (pending → approved → in_transit → received)
  - GST calculations (CGST/SGST/IGST)
  - E-Way Bill support
  - Transport details
  - Quality check & discrepancy tracking
  - Approval workflow

### 4. **InternalTransferItem Model** ✅
- **File**: `src/models/InternalTransferItem.js`
- **Features**:
  - Quantity tracking (requested, approved, shipped, received)
  - Discrepancy tracking (damaged, shortage, excess, rejected)
  - Pricing (cost, market, transfer)
  - Batch & expiry tracking
  - Quality grading (A, B, C, rejected)
  - Storage locations (source & destination)
  - Instance methods: `calculateDiscrepancy()`, `hasIssues()`

### 5. **InternalInvoice Model** ✅
- **File**: `src/models/InternalInvoice.js`
- **Features**:
  - Internal invoice numbering: `INV-INT-{FY}-{source}-{seq}`
  - Issuer & recipient tracking (warehouse/store)
  - GST breakdown (CGST/SGST/IGST)
  - Additional charges (transport, handling, packaging)
  - Payment tracking
  - E-Way Bill linkage
  - Revision & cancellation support
  - GST filing status

---

## 🔨 **Remaining Models to Build** (7/12)

### 6. **InternalInvoiceItem Model** ⏳
- Line items for internal invoices
- Product details, quantities, pricing
- Tax breakdown per item
- Batch tracking

### 7. **CreditNote Model** ⏳
- Credit note for order cancellations/returns
- Link to original invoice
- GST reversal tracking
- Refund details

### 8. **GSTLedger Model** ⏳
- Transaction-level GST tracking
- Support for warehouses AND stores
- Input/Output GST classification
- ITC eligibility tracking
- GSTR filing status

### 9. **GSTSummary Model** ⏳
- Monthly GST summaries
- Consolidated Input/Output GST
- ITC calculations
- Net GST payable/refundable
- GSTR-1 & GSTR-3B ready

### 10. **Enhanced Order Model** ⏳
- Add cancellation fields
- Refund tracking
- Credit note linkage
- Return management

### 11. **Enhanced Store Model** ⏳
- Add `primaryWarehouseId`
- Add `secondaryWarehouseId`
- Transfer settings (allow inter-store, warehouse returns)
- Store type & tier
- Auto-reorder settings

### 12. **Model Associations** ⏳
- Define all relationships between models
- Create index file for centralized imports

---

## 📦 **Utilities & Services to Build**

### **Invoice/Transfer Number Generation** ⏳
- `generateInternalTransferNumber()` → `IT-{FY}-{seq}`
- `generateInternalInvoiceNumber()` → `INV-INT-{FY}-{source}-{seq}`
- `generateCreditNoteNumber()` → `CN-{FY}-{store}-{seq}`
- `getCurrentFinancialYear()` → Calculate FY from date

### **GST Calculation Utilities** ⏳
- `calculateGSTBreakdown(items, sourceState, destState)`
- `calculateITC(ledgerEntries)`
- `isInterState(state1, state2)`

### **PDF Generation Services** ⏳
- `generateInternalInvoicePDF(invoiceId)`
- `generateTransferInvoicePDF(transferId)`
- `generateCreditNotePDF(creditNoteId)`
- `generateEWayBill(transferId)`

---

## 🛣️ **Routes & Controllers to Build**

### **Warehouse Management** ⏳
- `POST /api/warehouses` - Create warehouse
- `GET /api/warehouses` - List warehouses
- `GET /api/warehouses/:id` - Get warehouse
- `PUT /api/warehouses/:id` - Update warehouse
- `DELETE /api/warehouses/:id` - Delete warehouse
- `GET /api/warehouses/:id/inventory` - Warehouse inventory
- `POST /api/warehouses/:id/restock` - Restock items

### **Internal Transfers** ⏳
- `POST /api/internal-transfers` - Create transfer
- `GET /api/internal-transfers/:id` - Get transfer
- `PUT /api/internal-transfers/:id/approve` - Approve transfer
- `PUT /api/internal-transfers/:id/reject` - Reject transfer
- `PUT /api/internal-transfers/:id/ship` - Mark as shipped
- `PUT /api/internal-transfers/:id/receive` - Receive transfer
- `GET /api/internal-transfers/pending` - Pending approvals
- `GET /api/internal-transfers/in-transit` - In-transit transfers

### **Internal Invoicing** ⏳
- `POST /api/internal-invoices` - Create invoice
- `GET /api/internal-invoices/:id` - Get invoice
- `GET /api/internal-invoices/:id/pdf` - Download PDF
- `POST /api/internal-invoices/:id/email` - Email invoice
- `PUT /api/internal-invoices/:id/cancel` - Cancel invoice

### **GST & Compliance** ⏳
- `GET /api/gst/warehouses/:id/summary/:month/:year` - Warehouse GST summary
- `GET /api/gst/stores/:id/summary/:month/:year` - Store GST summary
- `GET /api/gst/:entityType/:id/ledger` - GST ledger entries
- `GET /api/gst/reports/gstr1` - GSTR-1 data
- `GET /api/gst/reports/gstr3b` - GSTR-3B data
- `POST /api/eway-bills` - Generate E-Way Bill
- `GET /api/eway-bills/active` - Active E-Way Bills

---

## 📊 **Database Migration Plan**

After all models are complete, we need to:

1. **Sync Models** - Run `sequelize.sync({ alter: true })` or create proper migrations
2. **Seed Data** - Create seed scripts for:
   - Sample warehouses
   - Warehouse inventory
   - Store-warehouse assignments
3. **Associations** - Ensure all foreign keys and relationships are working
4. **Indexes** - Verify all performance indexes are created

---

## 🎯 **Next Immediate Steps**

1. ✅ ~~Create Warehouse & WarehouseInventory models~~
2. ✅ ~~Create InternalTransfer & InternalTransferItem models~~
3. ✅ ~~Create InternalInvoice model~~
4. ⏳ Create InternalInvoiceItem model
5. ⏳ Create CreditNote model
6. ⏳ Create GSTLedger & GSTSummary models
7. ⏳ Enhance Order & Store models
8. ⏳ Create model associations/index file
9. ⏳ Build utility functions (number generation, GST calculation)
10. ⏳ Build PDF generation services
11. ⏳ Create warehouse management APIs
12. ⏳ Create internal transfer APIs
13. ⏳ Create internal invoicing APIs
14. ⏳ Create GST tracking APIs
15. ⏳ Testing & database seeding

---

## 📝 **Notes**

- All models use **UUID** primary keys (consistent with existing codebase)
- All models use **Sequelize ORM** with PostgreSQL
- Financial year format: `2024-25` (April to March)
- GST validation regex included where applicable
- Proper indexes added for query performance
- Enum values align with business requirements
- Decimal precision: (12,2) for amounts, (10,2) for prices

---

**Build Status**: **5 out of 12 models completed** (42%)  
**Estimated Completion**: Continue building remaining models, then utilities, then APIs
