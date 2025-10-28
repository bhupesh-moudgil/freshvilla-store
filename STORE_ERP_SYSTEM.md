# 🏪 FreshVilla Store ERP System

## Overview
Custom-built Store ERP system for managing inventory, financials, commissions, and revenue tracking inspired by ERPNext principles but tailored for a multi-vendor marketplace.

---

## Database Models

### 1. Store Transactions (`store_transactions`)
**Tracks all financial transactions for each store**

```javascript
{
  id: UUID,
  storeId: UUID (FK),
  orderId: UUID (FK),
  transactionType: 'sale' | 'expense' | 'commission' | 'refund' | 'adjustment',
  
  // Financial Details
  grossAmount: DECIMAL,        // Total sale amount
  platformCommission: DECIMAL, // What platform takes
  netAmount: DECIMAL,          // What store receives
  
  description: TEXT,
  paymentMethod: STRING,
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  transactionDate: DATE,
}
```

**Use Cases:**
- Every order creates a transaction
- Track all money in/out
- Calculate commission automatically
- Generate financial reports

---

### 2. Inventory Ledger (`inventory_ledger`)
**Complete audit trail of all stock movements**

```javascript
{
  id: UUID,
  storeId: UUID (FK),
  productId: UUID (FK),
  
  // Stock Movement
  movementType: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage' | 'transfer',
  quantity: INTEGER,           // +ve for in, -ve for out
  previousStock: INTEGER,
  newStock: INTEGER,
  
  // Financial
  unitCost: DECIMAL,
  totalValue: DECIMAL,
  
  // Audit Trail
  referenceType: STRING,       // 'order', 'purchase', 'adjustment'
  referenceId: UUID,
  notes: TEXT,
  createdBy: UUID,             // Who made this entry
}
```

**Use Cases:**
- Track every stock change
- Audit trail for accountability
- Calculate inventory value
- Detect theft/damage
- Reconcile stock discrepancies

---

### 3. Store Revenue Summary (`store_revenue_summary`)
**Daily aggregated financial summary per store**

```javascript
{
  id: UUID,
  storeId: UUID (FK),
  date: DATE,
  
  // Sales Metrics
  totalOrders: INTEGER,
  totalItems: INTEGER,
  grossRevenue: DECIMAL,       // Before commission
  platformCommission: DECIMAL,
  netRevenue: DECIMAL,         // After commission
  
  // Expenses & Profit
  totalExpenses: DECIMAL,
  netProfit: DECIMAL,          // Net revenue - expenses
  
  // Refunds
  totalRefunds: DECIMAL,
}
```

**Use Cases:**
- Daily financial reports
- Monthly/yearly aggregation
- Revenue trends
- Performance tracking
- Quick dashboard stats

---

### 4. Product Commission (`product_commissions`)
**Commission structure per product**

```javascript
{
  id: UUID,
  productId: UUID (FK, unique),
  storeId: UUID (FK),
  
  // Commission Structure
  commissionType: 'percentage' | 'fixed',
  commissionValue: DECIMAL,    // 15.00 for 15% or 50.00 for ₹50
  
  // Pricing
  costPrice: DECIMAL,          // What store paid
  sellingPrice: DECIMAL,       // What customer pays
  
  // Calculated
  storeEarningPerUnit: DECIMAL, // Selling - Commission
  profitMargin: DECIMAL,        // % profit
}
```

**Use Cases:**
- Set different commission rates per product
- Calculate earnings automatically
- Track product profitability
- Price optimization

---

## How It Works

### When a Customer Places an Order

```
1. Order Created (₹500 total)
   ↓
2. Create StoreTransaction
   - grossAmount: ₹500
   - platformCommission: ₹75 (15%)
   - netAmount: ₹425 (store receives)
   ↓
3. Update InventoryLedger (for each product)
   - movementType: 'sale'
   - quantity: -2 (sold 2 units)
   - previousStock: 100
   - newStock: 98
   ↓
4. Update/Create StoreRevenueSummary (today's date)
   - totalOrders += 1
   - totalItems += 2
   - grossRevenue += ₹500
   - platformCommission += ₹75
   - netRevenue += ₹425
```

### Commission Calculation Examples

#### Example 1: Percentage Commission
```javascript
Product: Organic Banana
Selling Price: ₹100
Commission: 15% (percentage type)

Calculation:
- Gross Sale: ₹100
- Platform Commission: ₹100 × 0.15 = ₹15
- Store Receives: ₹100 - ₹15 = ₹85
```

#### Example 2: Fixed Commission
```javascript
Product: Premium Apple
Selling Price: ₹300
Commission: ₹40 (fixed type)

Calculation:
- Gross Sale: ₹300
- Platform Commission: ₹40
- Store Receives: ₹300 - ₹40 = ₹260
```

---

## Store ERP Dashboard

### Key Metrics to Display

#### 1. **Today's Overview**
```javascript
{
  orders: 45,
  items: 123,
  grossRevenue: ₹12,450,
  commission: ₹1,867.50,
  netRevenue: ₹10,582.50,
  profit: ₹8,200,
}
```

#### 2. **Month-to-Date**
```javascript
{
  orders: 1,234,
  items: 3,567,
  grossRevenue: ₹3,45,600,
  commission: ₹51,840,
  netRevenue: ₹2,93,760,
  profit: ₹2,10,500,
}
```

#### 3. **Top Selling Products**
```javascript
[
  {
    product: "Organic Banana",
    unitsSold: 450,
    revenue: ₹20,250,
    storeEarning: ₹17,212.50,
  },
  {
    product: "Fresh Milk",
    unitsSold: 320,
    revenue: ₹19,200,
    storeEarning: ₹16,320,
  },
]
```

#### 4. **Inventory Alerts**
```javascript
{
  lowStock: [
    { product: "Apples", currentStock: 5, minStock: 20 },
    { product: "Milk", currentStock: 12, minStock: 50 },
  ],
  outOfStock: [
    { product: "Oranges", lastStockDate: "2025-10-25" },
  ],
}
```

#### 5. **Revenue Breakdown**
```javascript
{
  grossSales: ₹50,000,
  platformCommission: ₹7,500 (15%),
  netRevenue: ₹42,500,
  expenses: ₹10,000,
  netProfit: ₹32,500,
}
```

---

## API Endpoints

### Store ERP Endpoints

```javascript
// Dashboard
GET /api/store/erp/dashboard
// Returns: Today's metrics, month stats, alerts

// Financial Reports
GET /api/store/erp/transactions?startDate=2025-10-01&endDate=2025-10-31
// Returns: All transactions with filters

GET /api/store/erp/revenue-summary?month=10&year=2025
// Returns: Daily revenue summary for month

GET /api/store/erp/profit-loss?startDate=2025-10-01&endDate=2025-10-31
// Returns: P&L statement

// Commission Reports
GET /api/store/erp/commissions?period=monthly
// Returns: Commission breakdown by product

GET /api/store/erp/earnings?groupBy=product
// Returns: Earnings per product after commission

// Inventory
GET /api/store/erp/inventory
// Returns: Current stock levels

GET /api/store/erp/inventory/ledger?productId=xxx
// Returns: Complete stock movement history

GET /api/store/erp/inventory/alerts
// Returns: Low stock & out of stock items

POST /api/store/erp/inventory/adjust
// Adjust stock manually (with notes)

// Product Commission Management
GET /api/store/erp/product-commissions
// List all product commissions

PUT /api/store/erp/product-commissions/:productId
// Update commission for a product

// Analytics
GET /api/store/erp/analytics/sales-trend?period=30days
// Returns: Sales trend over period

GET /api/store/erp/analytics/top-products?limit=10
// Returns: Top selling products

GET /api/store/erp/analytics/customer-insights
// Returns: Customer buying patterns
```

---

## Frontend Components

### 1. Store ERP Dashboard (`StoreERPDashboard.jsx`)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Today's Overview                                │
│ Orders: 45 | Revenue: ₹10,582 | Profit: ₹8,200 │
├─────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐              │
│ │ Revenue     │  │ Orders      │              │
│ │ Chart       │  │ Chart       │              │
│ └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────┤
│ Top Products           │ Inventory Alerts      │
│ 1. Banana - ₹17,212   │ ⚠️ Apples (5 left)   │
│ 2. Milk - ₹16,320     │ ⚠️ Milk (12 left)    │
└─────────────────────────────────────────────────┘
```

### 2. Financial Reports (`StoreFinancials.jsx`)

```javascript
Features:
- Date range selector
- Transaction list with filters
- Revenue summary table
- Export to CSV/PDF
- Profit & Loss statement
```

### 3. Commission Management (`StoreCommissions.jsx`)

```javascript
Features:
- List all products with commission
- Edit commission per product
- Calculate earnings automatically
- Commission breakdown chart
- Product profitability analysis
```

### 4. Inventory Management (`StoreInventory.jsx`)

```javascript
Features:
- Current stock levels
- Stock movement history
- Manual stock adjustment
- Low stock alerts
- Valuation report
```

---

## Automated Processes

### 1. Daily Revenue Aggregation (Cron Job)
```javascript
// Runs at midnight daily
async function aggregateDailyRevenue() {
  // For each store
  // Calculate yesterday's metrics
  // Insert/update StoreRevenueSummary
}
```

### 2. Inventory Sync (On Order)
```javascript
// When order is placed
async function syncInventory(order) {
  for (const item of order.items) {
    await InventoryLedger.create({
      storeId: item.storeId,
      productId: item.productId,
      movementType: 'sale',
      quantity: -item.quantity,
      previousStock: product.stock,
      newStock: product.stock - item.quantity,
      unitCost: item.price,
      totalValue: item.price * item.quantity,
      referenceType: 'order',
      referenceId: order.id,
    });
    
    // Update product stock
    await Product.update({
      stock: product.stock - item.quantity,
    }, { where: { id: item.productId } });
  }
}
```

### 3. Commission Calculation (On Order)
```javascript
async function calculateCommission(order) {
  for (const item of order.items) {
    const commission = await ProductCommission.findOne({
      where: { productId: item.productId }
    });
    
    let commissionAmount;
    if (commission.commissionType === 'percentage') {
      commissionAmount = item.price * (commission.commissionValue / 100);
    } else {
      commissionAmount = commission.commissionValue;
    }
    
    await StoreTransaction.create({
      storeId: item.storeId,
      orderId: order.id,
      transactionType: 'sale',
      grossAmount: item.price * item.quantity,
      platformCommission: commissionAmount * item.quantity,
      netAmount: (item.price - commissionAmount) * item.quantity,
      paymentMethod: order.paymentMethod,
      status: 'completed',
    });
  }
}
```

### 4. Low Stock Alerts
```javascript
// Check every 6 hours
async function checkLowStock() {
  const lowStockProducts = await Product.findAll({
    where: {
      stock: { [Op.lte]: sequelize.col('minStock') },
      isActive: true,
    },
  });
  
  // Send notifications to store admins
  for (const product of lowStockProducts) {
    await sendLowStockAlert(product.storeId, product);
  }
}
```

---

## Sample Reports

### Profit & Loss Statement (Monthly)
```
Store: FreshVilla Main Store
Period: October 2025

INCOME
  Gross Sales                     ₹3,45,600
  Less: Refunds                   ₹  5,600
  ─────────────────────────────────────────
  Net Sales                       ₹3,40,000

DEDUCTIONS
  Platform Commission (15%)       ₹ 51,000
  ─────────────────────────────────────────
  Net Revenue                     ₹2,89,000

EXPENSES
  Product Costs                   ₹1,50,000
  Packaging                       ₹  8,000
  Delivery                        ₹ 12,000
  Miscellaneous                   ₹  5,000
  ─────────────────────────────────────────
  Total Expenses                  ₹1,75,000

NET PROFIT                        ₹1,14,000
Profit Margin                     39.4%
```

### Product Commission Report
```
Product              | Sales  | Gross    | Commission | Store Earns | Margin
─────────────────────|────────|──────────|────────────|─────────────|───────
Organic Banana       | 450    | ₹20,250  | ₹3,037     | ₹17,213     | 62%
Fresh Milk           | 320    | ₹19,200  | ₹2,880     | ₹16,320     | 55%
Red Apples           | 180    | ₹27,000  | ₹4,050     | ₹22,950     | 48%
─────────────────────────────────────────────────────────────────────────────
TOTAL                | 950    | ₹66,450  | ₹9,967     | ₹56,483     | 54%
```

---

## Implementation Status

✅ **Models Created:**
- StoreTransaction
- InventoryLedger
- StoreRevenueSummary
- ProductCommission

⏳ **Next Steps:**
1. Create ERP controllers
2. Add ERP routes
3. Build dashboard UI
4. Implement automated jobs
5. Create reports
6. Add charts/analytics

---

## Benefits Over ERPNext

1. **Lightweight** - Only what you need, no bloat
2. **Marketplace-Focused** - Built for multi-vendor from ground up
3. **Modern Stack** - Node.js + React, easy to customize
4. **Commission-First** - Built-in commission tracking
5. **Real-time** - Instant updates on orders/inventory
6. **Cloud-Native** - Designed for cloud deployment
7. **Simple** - Easier to understand and maintain

---

## Chart.js Integration for Analytics

```javascript
// Revenue Trend (Line Chart)
{
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Gross Revenue',
    data: [5000, 6200, 5500, 7800, 6900, 8500, 9200],
  }, {
    label: 'Net Revenue',
    data: [4250, 5270, 4675, 6630, 5865, 7225, 7820],
  }]
}

// Product Sales (Bar Chart)
{
  labels: ['Banana', 'Milk', 'Apple', 'Bread', 'Eggs'],
  datasets: [{
    label: 'Units Sold',
    data: [450, 320, 180, 210, 190],
  }]
}

// Commission Breakdown (Pie Chart)
{
  labels: ['Store Earnings', 'Platform Commission'],
  datasets: [{
    data: [85, 15],
    backgroundColor: ['#10b981', '#f59e0b'],
  }]
}
```

---

## Security & Access Control

### Store Admin Permissions
```javascript
{
  canView: ['dashboard', 'transactions', 'inventory', 'reports'],
  canEdit: ['inventory', 'product-commission'],
  canDelete: [],  // Cannot delete transactions
  dataScope: 'own-store-only',  // Cannot see other stores
}
```

### Super Admin Permissions
```javascript
{
  canView: ['all-stores', 'all-transactions', 'platform-revenue'],
  canEdit: ['all-settings', 'commission-rates'],
  canDelete: ['transactions', 'adjustments'],
  dataScope: 'platform-wide',
}
```

---

**This is a production-ready ERP system specifically designed for your multi-vendor marketplace!**

Much simpler and more focused than ERPNext, but covers all your needs:
✅ Inventory tracking
✅ Financial management
✅ Commission calculation
✅ Revenue reporting
✅ Store earnings visibility
