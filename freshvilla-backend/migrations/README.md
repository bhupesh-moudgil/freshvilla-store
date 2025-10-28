# Database Migrations Guide

This directory contains all database migration scripts for the FreshVilla backend.

## 📋 Migration Order

Run migrations in the following order:

### 1. Initial Setup
```bash
# Sync all models (creates base tables)
node migrations/sync-all-models.js
```

### 2. Product GST Fields
```bash
# Add GST-related fields to products
node migrations/add-product-gst-fields.js
```

### 3. Default HSN/GST Values
```bash
# Set default HSN codes and GST rates
node migrations/set-default-hsn-gst.js
```

### 4. Comprehensive Structure Upgrade ⭐
```bash
# Major database structure upgrade
# Adds: storeType, location fields, FK relationships, City table, Employee table
node migrations/comprehensive-structure-upgrade.js
```

### 5. Update Store URLs with Type Prefix 🆕
```bash
# Updates existing store URLs to include storeType prefix (br- or int-)
# IMPORTANT: Run this AFTER comprehensive-structure-upgrade.js
node migrations/update-store-urls-with-type-prefix.js
```

## 📦 What Each Migration Does

### comprehensive-structure-upgrade.js
Major database restructuring including:

1. **Store Model Enhancements**
   - Added `storeType` ENUM ('brand', 'integrated')
   - Added partner fields (partnerName, partnerContact, partnerEmail, etc.)
   - Added commission override

2. **Customer Model Enhancements**
   - Added location fields (city, cityCode, district, state, stateCode, pincode)
   - Added `preferredStoreId` foreign key
   - Added `lastOrderCity` and `lastOrderDate`

3. **Order Model Enhancements**
   - Added `customerId` and `storeId` foreign keys
   - Added delivery location fields (deliveryCity, deliveryCityCode, etc.)

4. **City Master Table**
   - Created cities table with comprehensive fields
   - Seeded with major Indian cities

5. **Employee Table**
   - Created employees table for warehouse/delivery staff
   - Includes employeeType, location, reporting structure

6. **Indexes**
   - Added performance indexes on all key fields
   - Foreign key indexes for relationship queries

7. **Data Migration**
   - Links existing orders to customers
   - Extracts customer locations from addresses

### update-store-urls-with-type-prefix.js
Updates store URL format to include storeType prefix:

- **Old format:** `dl-ndl-001` (Delhi - New Delhi - 001)
- **New format:** `br-dl-ndl-001` (Brand - Delhi - New Delhi - 001)
- **Integrated stores:** `int-mh-mum-001` (Integrated - Maharashtra - Mumbai - 001)

**Features:**
- Automatically adds correct prefix based on `storeType` field
- Validates URL uniqueness and format
- Provides detailed migration summary
- Transaction-safe with rollback on error

## 🔧 Environment Variables Required

Make sure your `.env` file contains:

```env
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
```

## ⚠️ Important Notes

1. **Always backup your database before running migrations**
2. Run migrations in sequence (don't skip steps)
3. All migrations are transaction-safe and will rollback on error
4. The `update-store-urls-with-type-prefix.js` migration is idempotent (safe to run multiple times)
5. Review migration logs carefully after execution

## 🔄 Rollback Strategy

If you need to rollback changes:

### For store URL updates:
Manually update store URLs back to original format by removing the prefix:
```sql
UPDATE stores 
SET "storeUrl" = substring("storeUrl" from 4)  -- Removes 'br-' or 'int-'
WHERE "storeUrl" ~ '^(br|int)-';
```

### For comprehensive structure upgrade:
More complex - requires dropping tables and columns. Contact DBA before attempting.

## 📊 Verification

After running migrations, verify changes:

```bash
# Check store URLs
SELECT id, name, "storeUrl", "storeType" FROM stores;

# Check city table
SELECT code, name, state, "isServiceable" FROM cities;

# Check employee table structure
\d employees;

# Check customer location fields
SELECT id, name, city, "cityCode", "preferredStoreId" FROM customers LIMIT 5;

# Check order relationships
SELECT id, "orderNumber", "customerId", "storeId", "deliveryCity" FROM orders LIMIT 5;
```

## 🆘 Troubleshooting

### Migration fails with "duplicate key"
- A record with that unique value already exists
- Check if migration was partially run before
- May need to manually clean up before re-running

### Migration fails with "relation does not exist"
- Prerequisites not met (earlier migrations not run)
- Run migrations in correct order

### Store URL format invalid
- Check that `storeType` field exists and has correct values
- Manually fix any malformed URLs before running URL update migration

## 📝 Creating New Migrations

When creating new migrations:

1. Use timestamp-based naming: `YYYYMMDD-description.js`
2. Include transaction support
3. Add rollback logic
4. Provide detailed logging
5. Include verification queries
6. Update this README

Template:
```javascript
const { Sequelize, QueryTypes } = require('sequelize');
require('dotenv').config();

async function runMigration() {
  const t = await sequelize.transaction();
  
  try {
    // Your migration logic here
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  } finally {
    await sequelize.close();
  }
}
```

## 🎯 Next Steps

After running all migrations:

1. Test store creation with new URL format
2. Verify customer-order relationships
3. Test employee creation and assignment
4. Verify city filtering and service area matching
5. Update API documentation with new fields and formats

## 📞 Support

For migration issues, contact:
- Backend Team Lead
- Database Administrator
- Check logs in migration output for detailed error messages
