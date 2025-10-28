# FreshVilla Backend API Documentation
**Version:** 2.0  
**Last Updated:** October 28, 2025

---

## 🔐 Authentication

All API endpoints (except auth endpoints) require JWT authentication.

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

**Admin-Only Endpoints:**
Endpoints marked with 🔒 require admin privileges.

---

## 📋 Table of Contents

1. [Loyalty Program API](#loyalty-program-api)
2. [Internal Transfers API](#internal-transfers-api)
3. [Internal Invoices API](#internal-invoices-api)
4. [GST Management API](#gst-management-api)
5. [Credit Notes API](#credit-notes-api)
6. [Warehouse Management API](#warehouse-management-api)

---

## 🎁 Loyalty Program API

Base URL: `/api/loyalty`

### Program Management

#### Create Loyalty Program 🔒
```http
POST /api/loyalty/programs
```

**Body:**
```json
{
  "programName": "FreshVilla Rewards",
  "description": "Earn points on every purchase",
  "pointsPerRupee": 1,
  "pointsExpiryDays": 365,
  "signupBonusPoints": 100,
  "birthdayBonusPoints": 50,
  "referralBonusPoints": 200,
  "isActive": true
}
```

**Response:** `201 Created`

---

#### Get All Programs
```http
GET /api/loyalty/programs?isActive=true
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "programName": "FreshVilla Rewards",
      "tiers": [...]
    }
  ]
}
```

---

#### Get Single Program
```http
GET /api/loyalty/programs/:id
```

**Response:** `200 OK` - Program with tiers and rules

---

#### Update Program 🔒
```http
PUT /api/loyalty/programs/:id
```

**Body:** Partial program data

---

#### Delete Program 🔒
```http
DELETE /api/loyalty/programs/:id
```

**Response:** `200 OK`

---

### Tier Management

#### Create Tier 🔒
```http
POST /api/loyalty/tiers
```

**Body:**
```json
{
  "programId": "uuid",
  "tierName": "Gold",
  "tierLevel": 3,
  "tierColor": "#FFD700",
  "minimumSpend": 50000,
  "minimumOrders": 20,
  "pointsMultiplier": 1.5,
  "freeShippingThreshold": 0,
  "exclusiveDiscountPercent": 5
}
```

---

#### Get Tiers
```http
GET /api/loyalty/tiers/:programId
```

**Response:** List of tiers ordered by level

---

#### Update Tier 🔒
```http
PUT /api/loyalty/tiers/:id
```

---

#### Delete Tier 🔒
```http
DELETE /api/loyalty/tiers/:id
```

---

### Rule Management

#### Create Rule 🔒
```http
POST /api/loyalty/rules
```

**Body:**
```json
{
  "programId": "uuid",
  "ruleName": "Purchase Points",
  "ruleType": "earning_purchase",
  "pointsPerRupee": 1,
  "minimumOrderAmount": 500,
  "isActive": true
}
```

---

#### Get Rules
```http
GET /api/loyalty/rules/:programId?isActive=true
```

---

#### Update/Delete Rule 🔒
```http
PUT /api/loyalty/rules/:id
DELETE /api/loyalty/rules/:id
```

---

### Customer Loyalty

#### Enroll Customer
```http
POST /api/loyalty/customer/:customerId/enroll
```

**Body:**
```json
{
  "programId": "uuid",
  "source": "manual"
}
```

**Response:** Customer loyalty record with signup bonus awarded

---

#### Get Customer Loyalty Status
```http
GET /api/loyalty/customer/:customerId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "pointsBalance": 1250,
    "lifetimePointsEarned": 2000,
    "currentTier": {
      "tierName": "Silver",
      "tierLevel": 2
    },
    "totalOrders": 15,
    "totalSpend": 25000
  }
}
```

---

#### Award Points
```http
POST /api/loyalty/customer/:customerId/points
```

**Body:**
```json
{
  "points": 100,
  "sourceType": "order",
  "sourceId": "order-uuid",
  "sourceReference": "ORD123",
  "description": "Order purchase points",
  "ruleId": "rule-uuid"
}
```

**Response:** Points awarded, new balance, tier upgrade notification

---

#### Redeem Points
```http
POST /api/loyalty/customer/:customerId/redeem
```

**Body:**
```json
{
  "points": 500,
  "redemptionValue": 50,
  "orderId": "uuid",
  "description": "Order discount"
}
```

**Response:** Points redeemed, new balance

---

#### Get Points History
```http
GET /api/loyalty/customer/:customerId/history?page=1&limit=50&transactionType=earned
```

**Response:** Paginated points transaction history

---

#### Check Tier Upgrade
```http
GET /api/loyalty/customer/:customerId/tier-check
```

**Response:** Eligibility status, current/next tier, progress

---

### Loyalty Coupons

#### Create Coupon 🔒
```http
POST /api/loyalty/coupons
```

**Body:**
```json
{
  "programId": "uuid",
  "couponCode": "GOLD500",
  "couponName": "Gold Member Discount",
  "couponType": "tier_exclusive",
  "requiredTierId": "uuid",
  "pointsCost": 100,
  "discountType": "fixed",
  "discountValue": 500,
  "validFrom": "2025-01-01",
  "validUntil": "2025-12-31"
}
```

---

#### Get Coupons
```http
GET /api/loyalty/coupons?programId=uuid&isActive=true
```

---

#### Claim Coupon
```http
POST /api/loyalty/coupons/:id/claim
```

**Body:**
```json
{
  "customerId": "uuid"
}
```

**Response:** Coupon details, points deducted

---

#### Get Customer's Available Coupons
```http
GET /api/loyalty/coupons/customer/:customerId
```

**Response:** Coupons available for customer's tier and points

---

### Loyalty Dashboard 🔒

#### Get Program Dashboard
```http
GET /api/loyalty/dashboard/:programId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEnrolled": 5000,
      "pointsIssued": 1000000,
      "pointsRedeemed": 250000,
      "redemptionRate": "25.00"
    },
    "tierDistribution": [
      {
        "tierName": "Bronze",
        "memberCount": 3000
      }
    ],
    "recentActivities": [...],
    "topEarners": [...]
  }
}
```

---

## 📦 Internal Transfers API

Base URL: `/api/internal-transfers`

### Create Transfer
```http
POST /api/internal-transfers
```

**Body:**
```json
{
  "fromType": "warehouse",
  "fromId": "uuid",
  "toType": "store",
  "toId": "uuid",
  "transferReason": "stock_replenishment",
  "notes": "Weekly stock transfer",
  "requestedBy": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 100,
      "unitCost": 50
    }
  ]
}
```

**Response:** `201 Created` - Transfer created with status "pending"

---

### Get Transfers
```http
GET /api/internal-transfers?status=pending&fromId=uuid&startDate=2025-01-01&page=1
```

**Response:** Paginated list of transfers

---

### Get Transfer Details
```http
GET /api/internal-transfers/:id
```

**Response:** Transfer with items

---

### Approve Transfer
```http
PUT /api/internal-transfers/:id/approve
```

**Body:**
```json
{
  "approvedBy": "uuid"
}
```

**Response:** Transfer status updated to "approved"

---

### Ship Transfer
```http
PUT /api/internal-transfers/:id/ship
```

**Body:**
```json
{
  "shippedBy": "uuid",
  "trackingNumber": "TRK123",
  "carrier": "Blue Dart"
}
```

**Response:** Status "in_transit", inventory deducted from source

---

### Receive Transfer
```http
PUT /api/internal-transfers/:id/receive
```

**Body:**
```json
{
  "receivedBy": "uuid",
  "receivedQuantities": {
    "product-uuid": 98
  },
  "notes": "2 items damaged"
}
```

**Response:** Status "completed", inventory added to destination

---

### Cancel Transfer
```http
DELETE /api/internal-transfers/:id
```

**Body:**
```json
{
  "cancelReason": "No longer needed"
}
```

**Response:** Transfer cancelled, stock restored if needed

---

### Get Transfer Statistics 🔒
```http
GET /api/internal-transfers/stats?startDate=2025-01-01&endDate=2025-01-31
```

**Response:** Status counts, total value, avg processing time

---

## 💰 Internal Invoices API

Base URL: `/api/internal-invoices`

### Create Invoice
```http
POST /api/internal-invoices
```

**Body:**
```json
{
  "fromType": "warehouse",
  "fromId": "uuid",
  "toType": "store",
  "toId": "uuid",
  "invoiceType": "transfer",
  "dueDate": "2025-02-28",
  "taxRate": 18,
  "items": [
    {
      "productId": "uuid",
      "quantity": 100,
      "unitPrice": 50,
      "description": "Product transfer"
    }
  ]
}
```

**Response:** `201 Created` - Invoice with auto-calculated GST

---

### Get Invoices
```http
GET /api/internal-invoices?status=pending&toId=uuid&page=1
```

**Response:** Paginated invoices list

---

### Get Invoice
```http
GET /api/internal-invoices/:id
```

**Response:** Invoice with items

---

### Update Invoice 🔒
```http
PUT /api/internal-invoices/:id
```

**Body:** Allowed fields: dueDate, notes, invoiceType

---

### Record Payment
```http
PUT /api/internal-invoices/:id/pay
```

**Body:**
```json
{
  "paymentAmount": 5900,
  "paymentMethod": "bank_transfer",
  "paymentReference": "TXN123456",
  "paymentDate": "2025-01-15",
  "notes": "Full payment"
}
```

**Response:** Payment recorded, status updated

---

### Cancel Invoice 🔒
```http
DELETE /api/internal-invoices/:id
```

**Body:**
```json
{
  "cancelReason": "Duplicate invoice"
}
```

**Response:** Invoice cancelled (only if not paid)

---

### Get Pending Invoices
```http
GET /api/internal-invoices/pending?locationId=uuid&locationType=store
```

**Response:** Pending/partial invoices with aging info

---

### Get Invoice Statistics 🔒
```http
GET /api/internal-invoices/stats?startDate=2025-01-01&storeId=uuid
```

**Response:** Status counts, outstanding amounts, overdue info

---

## 📊 GST Management API

Base URL: `/api/gst` (All endpoints 🔒 Admin Only)

### Get GST Ledger
```http
GET /api/gst/ledger?storeId=uuid&transactionType=output&startDate=2025-01-01&page=1
```

**Response:** Paginated ledger entries with totals

---

### Get GST Summary
```http
GET /api/gst/summary/:month/:year?storeId=uuid
```

**Example:** `GET /api/gst/summary/1/2025`

**Response:**
```json
{
  "success": true,
  "data": {
    "summaries": [
      {
        "storeId": "uuid",
        "month": 1,
        "year": 2025,
        "outputCGST": 10000,
        "outputSGST": 10000,
        "outputIGST": 5000,
        "inputCGST": 2000,
        "inputSGST": 2000,
        "netCGST": 8000,
        "netSGST": 8000,
        "totalGSTLiability": 21000
      }
    ],
    "grandTotals": {...}
  }
}
```

---

### Generate GST Summary
```http
POST /api/gst/summary/generate
```

**Body:**
```json
{
  "month": 1,
  "year": 2025,
  "storeId": "uuid"
}
```

**Response:** Generated summaries for all stores (or specific store)

---

### File GST Return
```http
PUT /api/gst/summary/:id/file
```

**Body:**
```json
{
  "filingReference": "ARN123456789",
  "filedDate": "2025-02-10"
}
```

**Response:** Summary marked as filed

---

### Get GSTR-1 Report
```http
GET /api/gst/report/gstr1?month=1&year=2025&storeId=uuid
```

**Response:** GSTR-1 format (outward supplies) grouped by GST rate

---

### Get GSTR-3B Report
```http
GET /api/gst/report/gstr3b?month=1&year=2025&storeId=uuid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gstin": "27XXXXX1234X1Z5",
    "period": { "month": 1, "year": 2025 },
    "outwardSupplies": {
      "taxableValue": "100000.00",
      "cgst": "9000.00",
      "sgst": "9000.00",
      "totalTax": "18000.00"
    },
    "inwardSupplies": {...},
    "netGST": {
      "totalLiability": "15000.00"
    }
  }
}
```

---

### Get Store GST Summary
```http
GET /api/gst/store/:storeId/summary?startDate=2025-01-01&endDate=2025-12-31
```

**Response:** Historical GST summaries for store

---

## 📝 Credit Notes API

Base URL: `/api/credit-notes`

### Create Credit Note
```http
POST /api/credit-notes
```

**Body:**
```json
{
  "creditNoteType": "return",
  "referenceType": "order",
  "referenceId": "order-uuid",
  "referenceNumber": "ORD123",
  "storeId": "uuid",
  "customerId": "uuid",
  "reason": "Product return",
  "amount": 1000,
  "taxAmount": 180,
  "totalAmount": 1180,
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 500
    }
  ]
}
```

**Response:** `201 Created` - Credit note with status "pending"

---

### Get Credit Notes
```http
GET /api/credit-notes?status=pending&storeId=uuid&page=1
```

**Response:** Paginated list

---

### Get Credit Note
```http
GET /api/credit-notes/:id
```

**Response:** Credit note details

---

### Approve Credit Note
```http
PUT /api/credit-notes/:id/approve
```

**Body:**
```json
{
  "approvalNotes": "Approved for return"
}
```

**Response:** Status updated to "approved"

---

### Apply Credit Note
```http
PUT /api/credit-notes/:id/apply
```

**Body:**
```json
{
  "applyToReferenceId": "new-order-uuid",
  "applyToReferenceType": "order",
  "appliedAmount": 1180
}
```

**Response:** Credit note applied, status updated

---

### Void Credit Note 🔒
```http
DELETE /api/credit-notes/:id
```

**Body:**
```json
{
  "voidReason": "Issued in error"
}
```

**Response:** Credit note voided (cannot void if applied)

---

### Get Credit Note Statistics 🔒
```http
GET /api/credit-notes/stats?startDate=2025-01-01&storeId=uuid
```

**Response:** Status/type counts, total amounts

---

## 🏢 Warehouse Management API

Base URL: `/api/warehouses`

### Get Warehouse Dashboard
```http
GET /api/warehouses/:id/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "warehouse": {...},
    "capacity": {
      "total": 10000,
      "used": 6500,
      "available": 3500,
      "utilizationPercent": "65.00"
    },
    "inventory": {
      "totalProducts": 250,
      "totalStock": 15000,
      "availableStock": 12000,
      "reservedStock": 2500,
      "damagedStock": 500
    },
    "alerts": {
      "lowStock": [...],
      "expiringSoon": [...]
    },
    "recentTransfers": [...]
  }
}
```

---

### Get All Warehouses
```http
GET /api/warehouses?status=active&city=Mumbai
```

---

### Get Warehouse
```http
GET /api/warehouses/:id
```

---

### Create Warehouse 🔒
```http
POST /api/warehouses
```

**Body:** Warehouse data

---

### Update Warehouse 🔒
```http
PUT /api/warehouses/:id
```

---

### Delete Warehouse 🔒
```http
DELETE /api/warehouses/:id
```

**Note:** Cannot delete warehouse with active inventory

---

### Get Warehouse Inventory
```http
GET /api/warehouses/:id/inventory?search=product&lowStock=true
```

---

### Adjust Inventory Stock
```http
POST /api/warehouses/:warehouseId/inventory/:inventoryId/adjust
```

**Body:**
```json
{
  "adjustment": -50,
  "reason": "Damaged goods removal"
}
```

---

### Get Capacity Report
```http
GET /api/warehouses/:id/capacity-report
```

**Response:** Capacity metrics + inventory breakdown by category

---

## 📌 Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

---

## 🔄 Status Workflows

### Transfer Status Flow
```
pending → approved → in_transit → completed
                 ↓
              cancelled
```

### Invoice Status Flow
```
pending → partial → paid
       ↓
    cancelled
```

### Credit Note Status Flow
```
pending → approved → applied
       ↓
      void
```

### GST Summary Status
```
draft → filed
```

---

## 🎯 Rate Limits

- General API: 100 requests/15 min
- Auth endpoints: 5 requests/15 min
- Password reset: 3 requests/hour

---

## 🔐 Security

- All endpoints require JWT authentication
- Admin endpoints require admin role
- Transactions used for critical operations
- SQL injection prevention via Sequelize
- XSS protection via input sanitization

---

**For more details, see BUILD_STATUS.md and SESSION_COMPLETION_SUMMARY.md**
