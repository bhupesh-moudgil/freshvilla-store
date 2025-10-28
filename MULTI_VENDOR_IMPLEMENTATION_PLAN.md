# 🏪 Multi-Vendor Store System - Implementation Plan

## Overview
Transform FreshVilla into a multi-vendor marketplace where multiple stores can:
- Manage their own products
- Process orders independently
- Access their own admin panel
- Print bills and manage inventory

---

## Phase 1: Core Store Management (IMMEDIATE) ⚡

### Backend Tasks

#### 1.1 Store Model ✅
- [x] Created `Store.js` model with all fields
- Fields: name, slug, description, logo, banner, contact info, address, business details, operating hours, status, statistics

#### 1.2 Store Routes & Controllers
**Files to create:**
- `src/controllers/storeController.js`
- `src/routes/storeRoutes.js`

**Endpoints:**
```javascript
GET    /api/stores              // List all stores (public)
GET    /api/stores/:id          // Get single store (public)
POST   /api/stores              // Create store (admin only)
PUT    /api/stores/:id          // Update store (admin/store-owner)
DELETE /api/stores/:id          // Delete store (admin only)
PATCH  /api/stores/:id/toggle   // Toggle active status
```

#### 1.3 Update Product Model
**Add to Product model:**
```javascript
storeId: {
  type: DataTypes.UUID,
  allowNull: true,  // Make optional for migration
  references: {
    model: 'stores',
    key: 'id',
  },
}
```

#### 1.4 Database Migration
- Add `storeId` column to products table
- Create default store "FreshVilla Main Store"
- Assign all existing products to default store

#### 1.5 Seed Data
Add sample stores to seed script:
- FreshVilla Main Store
- Organic Valley Store
- Quick Mart
- Daily Needs Store

---

### Frontend Tasks

#### 1.6 Admin Panel - Stores Management

**Files to create:**
```
src/pages/Admin/Stores/
  ├── StoresList.jsx       // List all stores with CRUD actions
  ├── StoreCreate.jsx      // Create/Edit store form
  └── StoreDetails.jsx     // View store details and stats
```

**Features:**
- List all stores with search/filter
- Create new store with full form
- Edit store details
- Toggle active/inactive status
- Delete store with confirmation
- View store statistics (products, orders)

#### 1.7 Update Admin Navigation
Add "Stores" section after "Products" in admin sidebar

#### 1.8 Update Product Forms
Add store selection dropdown in:
- Product Create form
- Product Edit form

---

## Phase 2: Customer-Facing Store Pages 🛒

### 2.1 Remove Hardcoded Stores
**Files to update:**
```
src/pages/Shop/Shop.jsx
src/pages/Shop/ShopGridCol3.jsx
src/pages/Shop/ShopListCol.jsx
src/pages/store/StoreList.jsx
src/pages/store/SingleShop.jsx
```

**Replace hardcoded stores:**
- E-Grocery → Fetch from API
- DealShare → Fetch from API
- Blinkit → Fetch from API
- BigBasket → Fetch from API
- DMart → Fetch from API
- Spencers → Fetch from API
- StoreFront → Fetch from API

### 2.2 Dynamic Store Filters
Replace checkboxes with dynamic list from API:
```jsx
{stores.map((store) => (
  <div className="form-check mb-2" key={store.id}>
    <input
      type="checkbox"
      id={store.slug}
      value={store.id}
      onChange={(e) => handleStoreFilter(e)}
    />
    <label htmlFor={store.slug}>{store.name}</label>
  </div>
))}
```

### 2.3 Store List Page
Update `/StoreList` to fetch from database:
- Display all active stores
- Show store logo, name, rating
- Link to individual store page

### 2.4 Single Store Page
Update `/SingleShop/:slug` to:
- Fetch store by slug
- Display store details
- Show products from that store only
- Store hours, contact info

---

## Phase 3: Bulk Product Import 📊

### 3.1 Backend CSV Import

**Create:**
- `src/controllers/importController.js`
- `src/routes/importRoutes.js`

**Endpoint:**
```javascript
POST /api/import/products
Content-Type: multipart/form-data

// Accepts CSV/Excel file
// Parses and creates products in bulk
```

**CSV Format:**
```csv
name,description,price,originalPrice,category,unit,stock,storeId,image,featured
"Organic Banana","Fresh bananas",45,60,"Fruits & Vegetables","1 dozen",100,store-id-here,"/images/banana.jpg",true
```

### 3.2 Admin UI for Import

**File:** `src/pages/Admin/Products/ProductImport.jsx`

**Features:**
- Upload CSV/Excel file
- Preview data before import
- Validate data
- Show import progress
- Display errors/warnings
- Summary of imported products

### 3.3 Export Template
Provide downloadable CSV template with:
- Sample data
- Column descriptions
- Required vs optional fields

---

## Phase 4: Multi-Vendor Admin Panels 🏢

### 4.1 Store Owner Authentication

**Create new model:** `StoreAdmin.js`
```javascript
{
  id: UUID,
  storeId: UUID,  // Foreign key to Store
  email: String,
  password: String (hashed),
  name: String,
  role: 'owner' | 'manager',
  isActive: Boolean,
}
```

**Endpoints:**
```javascript
POST /api/store-auth/login       // Store admin login
POST /api/store-auth/register    // Register store admin (super admin only)
GET  /api/store-auth/me          // Get current store admin
```

### 4.2 Store-Specific Routes

**Middleware:** `verifyStoreAdmin` - checks store ownership

**Endpoints:**
```javascript
// Store Dashboard
GET /api/store/dashboard          // Stats for store owner's store

// Store Products
GET    /api/store/products        // List store's products only
POST   /api/store/products        // Create product for own store
PUT    /api/store/products/:id    // Update own product
DELETE /api/store/products/:id    // Delete own product

// Store Orders
GET /api/store/orders             // Orders for this store only
PUT /api/store/orders/:id/status  // Update order status

// Store Inventory
PUT /api/store/products/:id/stock // Update stock

// Store Billing
GET /api/store/bills              // Generate bills
POST /api/store/bills/print       // Print bill for order
```

### 4.3 Store Admin Frontend

**Create separate section:**
```
src/pages/StoreAdmin/
  ├── StoreLogin.jsx           // Store-specific login
  ├── StoreDashboard.jsx       // Store dashboard with stats
  ├── StoreProducts.jsx        // Manage store products
  ├── StoreOrders.jsx          // View and manage orders
  ├── StoreInventory.jsx       // Stock management
  ├── StoreBilling.jsx         // Print bills, invoices
  └── StoreSettings.jsx        // Store settings
```

**Route Structure:**
```
/store-admin/login
/store-admin/dashboard
/store-admin/products
/store-admin/orders
/store-admin/inventory
/store-admin/billing
/store-admin/settings
```

### 4.4 Bill Printing Feature

**Features:**
- Generate PDF invoice
- Store logo and details
- Customer details
- Itemized product list
- Taxes, discounts
- Payment method
- Store contact info
- Print button

**Libraries:**
- `react-to-print` for printing
- `jspdf` for PDF generation

---

## Phase 5: Advanced Features 🚀

### 5.1 Store Analytics
- Sales reports
- Product performance
- Customer insights
- Revenue tracking

### 5.2 Store Notifications
- New orders (real-time)
- Low stock alerts
- Customer messages

### 5.3 Store Reviews & Ratings
- Customers can rate stores
- Display average rating
- Review management

### 5.4 Commission Management
- Track platform commission
- Generate commission reports
- Payment history

---

## Implementation Order (Step-by-Step)

### Week 1: Core Store System
1. ✅ Create Store model
2. Create Store controller & routes
3. Update Product model with storeId
4. Create database migration
5. Seed sample stores
6. Admin UI for Stores management
7. Update Product forms with store selection

### Week 2: Customer Pages
8. Replace hardcoded stores with API
9. Dynamic store filters in shop pages
10. Update StoreList page
11. Update SingleShop page
12. Test all customer pages

### Week 3: Bulk Import
13. Create import controller
14. Build CSV parser
15. Admin import UI
16. Export template
17. Test bulk import

### Week 4: Multi-Vendor
18. Create StoreAdmin model
19. Store authentication system
20. Store-specific routes
21. Store admin frontend
22. Bill printing feature
23. Test complete flow

---

## Database Schema

### Tables
```sql
stores:
  - id (UUID, PK)
  - name, slug, description
  - logo, banner
  - contact info (email, phone, address)
  - business details (GST, FSSAI)
  - operating hours
  - status (isActive, isFeatured)
  - statistics (totalProducts, totalOrders, rating)
  - ownerId (FK to store_admins)
  - createdAt, updatedAt

products:
  - id (UUID, PK)
  - storeId (UUID, FK to stores) ← NEW
  - name, description, price, etc.
  - ...existing fields...

store_admins:
  - id (UUID, PK)
  - storeId (UUID, FK to stores)
  - email, password (hashed)
  - name, role
  - isActive
  - createdAt, updatedAt

orders:
  - id (UUID, PK)
  - storeId (UUID, FK to stores) ← NEW
  - ...existing fields...
```

---

## API Endpoints Summary

### Super Admin Endpoints
```
/api/stores              // Full CRUD for stores
/api/products            // All products across stores
/api/orders              // All orders across stores
/api/store-admins        // Manage store admin accounts
```

### Store Admin Endpoints
```
/api/store-auth          // Store login/register
/api/store/dashboard     // Store-specific dashboard
/api/store/products      // Own store products only
/api/store/orders        // Own store orders only
/api/store/inventory     // Stock management
/api/store/billing       // Bills and invoices
```

### Customer Endpoints
```
/api/stores              // Browse stores (public)
/api/products            // Browse products (filtered by store)
/api/orders              // Place orders
```

---

## Security Considerations

1. **Authentication Layers:**
   - Super Admin (platform owner)
   - Store Admin (store owner/manager)
   - Customer

2. **Authorization:**
   - Store admins can only access their own data
   - Super admin has access to everything
   - Customers can only see active stores/products

3. **Data Isolation:**
   - Middleware enforces store isolation
   - Store admins cannot see other stores' data

---

## Testing Checklist

### Phase 1 Testing
- [ ] Super admin can create stores
- [ ] Super admin can edit stores
- [ ] Super admin can delete stores
- [ ] Products can be assigned to stores
- [ ] All existing products migrated to default store

### Phase 2 Testing
- [ ] Store list page shows real stores
- [ ] Store filter works in shop pages
- [ ] Single store page displays correctly
- [ ] No hardcoded stores remain

### Phase 3 Testing
- [ ] CSV upload works
- [ ] Data validation works
- [ ] Products created in bulk
- [ ] Errors handled gracefully

### Phase 4 Testing
- [ ] Store admin can log in
- [ ] Store admin sees only their data
- [ ] Can manage own products
- [ ] Can view own orders
- [ ] Can update stock
- [ ] Can print bills

---

## Current Status

✅ **Phase 1.1:** Store Model Created  
⏳ **Next:** Store Controller & Routes  

**Ready to proceed?** This is a large undertaking. I can implement:
1. **Quick version** (2-3 hours): Basic store CRUD in admin only
2. **Full version** (multiple days): Complete multi-vendor system

Which would you prefer?
