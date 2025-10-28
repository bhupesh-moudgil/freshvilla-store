# FreshVilla Backend - Pending Tasks & Improvements

## 📋 Complete Task List

**Last Updated:** October 28, 2024  
**Status:** Prioritized and Ready for Implementation

---

## 🔴 HIGH PRIORITY - Database Structure (Must Do)

### 1. Add Store Type Classification ⏳
**Status:** Not Started  
**Time:** 2 hours  
**Files:** `Store.js`, migration script

**Tasks:**
- [ ] Add `storeType` ENUM('brand', 'integrated') to Store model
- [ ] Add partner fields for integrated stores
- [ ] Create migration script
- [ ] Set default 'brand' for existing stores
- [ ] Update store creation API
- [ ] Update store URL format (br- or int- prefix)

---

### 2. Fix Customer Model - Add Location Fields ⏳
**Status:** Not Started  
**Time:** 3 hours  
**Files:** `Customer.js`, migration script

**Tasks:**
- [ ] Add city, cityCode, district fields
- [ ] Add state, stateCode fields
- [ ] Add preferredStoreId FK
- [ ] Add lastOrderCity field
- [ ] Create migration script
- [ ] Extract data from addresses JSONB
- [ ] Update customer registration API
- [ ] Update customer profile API

---

### 3. Fix Order Model - Add Relationships ⏳
**Status:** Not Started  
**Time:** 3 hours  
**Files:** `Order.js`, migration script

**Tasks:**
- [ ] Add customerId FK to customers table
- [ ] Add storeId FK to stores table
- [ ] Add city, cityCode, district fields
- [ ] Add state, stateCode fields
- [ ] Create migration script
- [ ] Match existing orders to customers (by email/mobile)
- [ ] Update order creation API
- [ ] Test cascade deletes

---

### 4. Create City Master Table ⏳
**Status:** Not Started  
**Time:** 4 hours  
**Files:** New `City.js` model, seed data

**Tasks:**
- [ ] Create City model with all fields
- [ ] Create migration script
- [ ] Seed with major Indian cities (Delhi, Mumbai, Bangalore, etc.)
- [ ] Add isServiceable flag
- [ ] Create city management API (CRUD)
- [ ] Add city dropdown endpoint
- [ ] Link to existing stores/customers/warehouses

---

### 5. Create Employee Model ⏳
**Status:** Not Started  
**Time:** 5 hours  
**Files:** New `Employee.js` model

**Tasks:**
- [ ] Create Employee model with all fields
- [ ] Add employeeType ENUM (warehouse_staff, delivery, etc.)
- [ ] Add workplace links (warehouseId, storeId)
- [ ] Add location fields (city, state)
- [ ] Add reporting hierarchy (reportingTo FK)
- [ ] Create migration script
- [ ] Create employee management API (CRUD)
- [ ] Add employee filtering (by type, location, workplace)

---

### 6. Create Model Associations File ⏳
**Status:** Not Started  
**Time:** 3 hours  
**Files:** New `src/models/associations.js`

**Tasks:**
- [ ] Create associations.js file
- [ ] Define Store → Order relationship (hasMany)
- [ ] Define Customer → Order relationship (hasMany)
- [ ] Define Order → Customer relationship (belongsTo)
- [ ] Define Order → Store relationship (belongsTo)
- [ ] Define Store → ServiceArea relationship (hasMany)
- [ ] Define Store → StoreUser relationship (hasMany)
- [ ] Define City → Store relationship (hasMany)
- [ ] Define City → Customer relationship (hasMany)
- [ ] Define Warehouse → Employee relationship (hasMany)
- [ ] Define Store → Employee relationship (hasMany)
- [ ] Test eager loading with includes
- [ ] Update controllers to use associations

---

### 7. Add Database Indexes & Constraints ⏳
**Status:** Not Started  
**Time:** 2 hours  
**Files:** Migration script

**Tasks:**
- [ ] Add index on orders.customerId
- [ ] Add index on orders.storeId
- [ ] Add index on customers.city
- [ ] Add index on customers.preferredStoreId
- [ ] Add index on employees.city
- [ ] Add index on employees.employeeType
- [ ] Add composite index on (city, state, isActive)
- [ ] Add cascade delete rules
- [ ] Add cascade update rules
- [ ] Test constraint violations

---

## 🟡 MEDIUM PRIORITY - Invoice System Enhancements

### 8. E-way Bill Generation ⏳
**Status:** Not Started  
**Time:** 4 hours  
**Files:** New utility, controller endpoints

**Tasks:**
- [ ] Create eWayBillGenerator.js utility
- [ ] Add e-way bill template with GST details
- [ ] Add sender/receiver info
- [ ] Add item details with HSN codes
- [ ] Create generation endpoint
- [ ] Link to internal transfers
- [ ] Store eWayBillPath in InternalInvoice
- [ ] Add download endpoint
- [ ] Test PDF generation

---

### 9. Invoice Aging & Statistics Reports ⏳
**Status:** Partially Done (basic stats exist)  
**Time:** 3 hours  
**Files:** `internalInvoiceController.js`

**Tasks:**
- [ ] Enhance getInvoiceStats endpoint
- [ ] Add aging buckets (0-30, 31-60, 61-90, 90+ days)
- [ ] Add payment trend analysis
- [ ] Add store-wise invoice summary
- [ ] Add warehouse-wise invoice summary
- [ ] Add monthly invoice report
- [ ] Add overdue invoice alerts
- [ ] Create dashboard data endpoint

---

## 🟢 LOW PRIORITY - Nice to Have

### 10. Email Invoice Functionality ⏳
**Status:** Not Started  
**Time:** 3 hours

**Tasks:**
- [ ] Create email template for invoices
- [ ] Add send email endpoint
- [ ] Auto-send on invoice issue
- [ ] Add email tracking (sent, opened)
- [ ] Add resend functionality

---

### 11. Warehouse Dashboard ⏳
**Status:** Not Started  
**Time:** 6 hours

**Tasks:**
- [ ] Create warehouse dashboard endpoint
- [ ] Add inventory summary
- [ ] Add pending transfers
- [ ] Add low stock alerts
- [ ] Add transfer statistics
- [ ] Add invoice statistics

---

### 12. Bulk Invoice Generation ⏳
**Status:** Not Started  
**Time:** 4 hours

**Tasks:**
- [ ] Add bulk create endpoint
- [ ] Support CSV upload
- [ ] Add validation
- [ ] Generate multiple PDFs
- [ ] Add batch status tracking

---

## 📊 Summary Statistics

### By Priority:
- **High Priority:** 7 tasks (Database structure)
- **Medium Priority:** 2 tasks (Invoice enhancements)
- **Low Priority:** 3 tasks (Nice to have)
- **Total:** 12 tasks

### By Status:
- **Not Started:** 11 tasks
- **Partially Done:** 1 task (Invoice stats)
- **Completed:** 0 tasks from this list

### Time Estimates:
- **High Priority:** ~22 hours (3 days)
- **Medium Priority:** ~7 hours (1 day)
- **Low Priority:** ~13 hours (1.5 days)
- **Total:** ~42 hours (5-6 days)

---

## 🎯 Recommended Implementation Order

### Week 1: Database Foundation
1. **Day 1-2:** Store type, Customer location, Order relationships
2. **Day 2-3:** City master table, seed data
3. **Day 3:** Employee model, associations file
4. **Day 4:** Indexes, constraints, testing

### Week 2: Enhancements
5. **Day 5:** E-way bill generation
6. **Day 6:** Invoice aging reports
7. **Day 7:** Testing, documentation, deployment

### Week 3 (Optional): Nice to Have
8. Email functionality
9. Warehouse dashboard
10. Bulk operations

---

## ✅ Recently Completed (For Reference)

### GST Invoice System (Oct 28, 2024)
- [x] Product model - HSN code, GST rate, SKU
- [x] Enhanced invoice creation with auto GST calculation
- [x] Inter-state vs intra-state detection
- [x] CGST/SGST/IGST calculation
- [x] Financial year management
- [x] Professional PDF generation
- [x] Invoice numbering system
- [x] Database migration for products
- [x] PDF generation endpoints
- [x] Complete documentation

---

## 🔄 Continuous Improvements

### Ongoing:
- Performance monitoring
- Bug fixes
- Security updates
- Documentation updates

---

## 📝 Notes

### Database Structure Tasks (High Priority)
**Why Critical:**
- Foundation for scalability
- Required for proper reporting
- Enables location-based features
- Improves data integrity
- Reduces technical debt

**Impact if Not Done:**
- Cannot distinguish store types
- Poor query performance
- No location-based analytics
- Data integrity issues
- Difficult to scale

### Invoice System Tasks (Medium Priority)
**Why Important:**
- Compliance (e-way bills)
- Better insights (aging reports)
- Operational efficiency

**Impact if Not Done:**
- Manual e-way bill generation
- Limited visibility into overdue invoices
- Manual follow-ups needed

### Nice to Have Tasks (Low Priority)
**Why Optional:**
- Can work without them initially
- Can be added incrementally
- ROI lower than critical fixes

---

## 🆘 Blockers & Dependencies

### No Blockers Currently
All tasks can proceed independently

### Dependencies:
- City master table should be done before linking customers/orders
- Associations file should be done after FK relationships are added
- Indexes should be last (after structure is finalized)

---

## 📞 Support & Questions

For task clarification or implementation help:
1. Refer to detailed docs in `/docs/`
2. Check `DATABASE_STRUCTURE_ANALYSIS.md`
3. Review `IMPLEMENTATION_COMPLETE.md` for GST invoice examples

---

**Status:** 📋 **READY TO START**  
**Next Step:** Begin with High Priority items (Database Structure)  
**Priority:** Database foundation first, then enhancements
