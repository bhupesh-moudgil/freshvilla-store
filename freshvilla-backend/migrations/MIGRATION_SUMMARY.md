# Database Migration Summary - GST Compliance

## ✅ Migration Completed Successfully

**Date:** October 28, 2024  
**Database:** Supabase PostgreSQL  
**Environment:** Production (prod-github)

---

## 🎯 What Was Done

### 1. Added New Columns to Products Table

```sql
ALTER TABLE products 
  ADD COLUMN "hsnCode" VARCHAR(20),
  ADD COLUMN "gstRate" DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN "sku" VARCHAR(50);
```

**Result:** ✅ All columns added successfully

### 2. Added Database Constraints

```sql
-- GST Rate validation
ALTER TABLE products 
  ADD CONSTRAINT check_gst_rate 
  CHECK ("gstRate" IN (0, 5, 12, 18, 28));

-- SKU uniqueness
ALTER TABLE products 
  ADD CONSTRAINT products_sku_key 
  UNIQUE ("sku");
```

**Result:** ✅ Both constraints added successfully

### 3. Populated Default Values

Updated existing products with category-specific defaults:

| Category | HSN Code | GST Rate | Products Updated |
|----------|----------|----------|------------------|
| Fruits & Vegetables | 0701 | 0% | 2 |
| Dairy & Eggs | 0401 | 5% | 1 |
| Groceries | 1001 | 5% | 0 (no products) |
| Snacks & Beverages | 2202 | 12% | 0 (no products) |
| Bakery | 1905 | 18% | 0 (no products) |
| Personal Care | 3304 | 18% | 0 (no products) |
| Household | 3402 | 18% | 0 (no products) |
| Others | 9999 | 18% | 0 (no products) |

**Total Products Updated:** 3

### 4. Generated SKUs

Auto-generated unique SKUs for all products:

- **FRV-00001** - Fresh Red Apples
- **FRV-00002** - Organic Fresh Bananas
- **DRY-00003** - Amul Fresh Milk

**Format:** `{CATEGORY_PREFIX}-{5-DIGIT-NUMBER}`

---

## 📊 Current Database State

### Products Table Schema (GST Fields)

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| hsnCode | VARCHAR(20) | NULL | - |
| gstRate | DECIMAL(5,2) | 0 | Must be 0, 5, 12, 18, or 28 |
| sku | VARCHAR(50) | NULL | UNIQUE |

### Sample Products with GST Data

```
┌─────────────────────────┬────────────────────────┬────────────┬─────────┬─────────┬────────┐
│ name                    │ category               │ sku        │ hsnCode │ gstRate │ price  │
├─────────────────────────┼────────────────────────┼────────────┼─────────┼─────────┼────────┤
│ Organic Fresh Bananas   │ Fruits & Vegetables    │ FRV-00002  │ 0701    │ 0.00    │ 45.00  │
│ Fresh Red Apples        │ Fruits & Vegetables    │ FRV-00001  │ 0701    │ 0.00    │ 150.00 │
│ Amul Fresh Milk         │ Dairy & Eggs           │ DRY-00003  │ 0401    │ 5.00    │ 60.00  │
└─────────────────────────┴────────────────────────┴────────────┴─────────┴─────────┴────────┘
```

---

## 🚀 Next Steps for Product Management

### Adding New Products

When creating new products, ensure you provide:

1. **HSN Code** - Mandatory for GST compliance
2. **GST Rate** - Select from: 0, 5, 12, 18, or 28%
3. **SKU** - Optional (can be auto-generated)

### Example: Creating a New Product

```javascript
POST /api/products
{
  "name": "Tata Salt",
  "category": "Groceries",
  "price": 25.00,
  "hsnCode": "2501",  // Salt HSN code
  "gstRate": 5,       // 5% GST for salt
  "sku": "GRO-00004", // Optional
  "description": "1 KG pack"
}
```

### Bulk Update Existing Products

If you have many products to update, use the admin panel or create a CSV import script.

---

## 🔐 HSN Code Reference by Category

### Common HSN Codes for FreshVilla Products

| Product Type | HSN Code | GST Rate | Examples |
|--------------|----------|----------|----------|
| Fresh Vegetables | 0701-0714 | 0% | Tomatoes, Onions, Potatoes |
| Fresh Fruits | 0801-0810 | 0% | Apples, Bananas, Mangoes |
| Rice | 1006 | 5% | Basmati, Regular Rice |
| Wheat | 1001 | 5% | Wheat flour, Atta |
| Milk | 0401 | 5% | Fresh milk, Packaged milk |
| Yogurt | 0403 | 5% | Curd, Dahi |
| Eggs | 0407 | 0% | Chicken eggs |
| Salt | 2501 | 5% | Iodized salt |
| Sugar | 1701 | 5% | White sugar |
| Cooking Oil | 1507-1515 | 5% | Sunflower, Mustard oil |
| Bread | 1905 | 18% | White bread, Brown bread |
| Biscuits | 1905 | 18% | Cookies, Crackers |
| Soft Drinks | 2202 | 28% | Cola, Juice drinks |
| Packaged Snacks | 2106 | 12% | Chips, Namkeen |
| Soap | 3401 | 18% | Bathing soap |
| Detergent | 3402 | 18% | Washing powder, Liquid |
| Shampoo | 3305 | 18% | Hair care products |
| Toothpaste | 3306 | 18% | Dental care |

---

## 📝 Migration Files Created

1. **`migrations/add-product-gst-fields.js`**
   - Adds columns to Product table
   - Adds constraints
   - Verifies changes

2. **`migrations/set-default-hsn-gst.js`**
   - Sets default HSN codes by category
   - Generates SKUs
   - Can be re-run safely

3. **`migrations/MIGRATION_SUMMARY.md`**
   - This document

---

## ✅ Verification Checklist

- [x] Columns added to products table
- [x] GST rate constraint added
- [x] SKU unique constraint added
- [x] Default HSN codes populated
- [x] Default GST rates populated
- [x] SKUs generated
- [x] Verification queries run successfully
- [x] Sample data retrieved correctly

---

## 🔄 Re-running Migrations

All migration scripts are **idempotent** - they can be run multiple times safely:

```bash
# Add columns (safe to re-run)
node migrations/add-product-gst-fields.js

# Set defaults for new products (safe to re-run)
node migrations/set-default-hsn-gst.js
```

---

## 🆘 Rollback (If Needed)

To rollback the changes:

```sql
-- Remove constraints
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_gst_rate;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Remove columns
ALTER TABLE products DROP COLUMN IF EXISTS "hsnCode";
ALTER TABLE products DROP COLUMN IF EXISTS "gstRate";
ALTER TABLE products DROP COLUMN IF EXISTS "sku";
```

**⚠️ Warning:** This will delete all HSN codes, GST rates, and SKUs!

---

## 📞 Support

For any issues with the migration:
1. Check migration logs in `/migrations/`
2. Verify database connection in `.env`
3. Test with sample product creation
4. Check Supabase dashboard for table structure

---

## 🎉 Success!

Your FreshVilla database is now fully GST-compliant and ready for internal invoicing with automatic tax calculations!

**Migration Status:** ✅ COMPLETE  
**Database Status:** ✅ HEALTHY  
**Ready for Production:** ✅ YES
