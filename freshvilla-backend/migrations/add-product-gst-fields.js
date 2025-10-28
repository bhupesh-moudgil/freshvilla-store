/**
 * Migration: Add GST compliance fields to Product table
 * - hsnCode: HSN/SAC code for GST
 * - gstRate: Tax rate (0, 5, 12, 18, 28)
 * - sku: Stock Keeping Unit
 */

const { Sequelize, QueryTypes } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  }
);

async function runMigration() {
  try {
    console.log('🔌 Connecting to Supabase...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully!\n');

    console.log('📋 Starting migration: Add GST fields to Product table\n');

    // Check if columns already exist
    const checkColumns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('hsnCode', 'gstRate', 'sku')
    `, { type: QueryTypes.SELECT });

    const existingColumns = checkColumns.map(row => row.column_name);
    console.log('📊 Existing GST columns:', existingColumns.length > 0 ? existingColumns : 'None');

    // Add hsnCode column
    if (!existingColumns.includes('hsnCode')) {
      console.log('➕ Adding column: hsnCode');
      await sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN "hsnCode" VARCHAR(20)
      `);
      console.log('✅ Added hsnCode column');
    } else {
      console.log('⏭️  Column hsnCode already exists');
    }

    // Add gstRate column
    if (!existingColumns.includes('gstRate')) {
      console.log('➕ Adding column: gstRate');
      await sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN "gstRate" DECIMAL(5,2) DEFAULT 0
      `);
      console.log('✅ Added gstRate column');
    } else {
      console.log('⏭️  Column gstRate already exists');
    }

    // Add sku column
    if (!existingColumns.includes('sku')) {
      console.log('➕ Adding column: sku');
      await sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN "sku" VARCHAR(50)
      `);
      console.log('✅ Added sku column');
    } else {
      console.log('⏭️  Column sku already exists');
    }

    // Add constraint for GST rate (drop if exists, then create)
    console.log('\n🔐 Adding constraint for gstRate values...');
    try {
      await sequelize.query(`
        ALTER TABLE products 
        DROP CONSTRAINT IF EXISTS check_gst_rate
      `);
      
      await sequelize.query(`
        ALTER TABLE products 
        ADD CONSTRAINT check_gst_rate 
        CHECK ("gstRate" IN (0, 5, 12, 18, 28))
      `);
      console.log('✅ Added check constraint for gstRate');
    } catch (error) {
      console.log('⚠️  Constraint might already exist:', error.message);
    }

    // Add unique constraint for sku (if not exists)
    console.log('\n🔐 Adding unique constraint for SKU...');
    try {
      await sequelize.query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'products' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%sku%'
      `, { type: QueryTypes.SELECT });
      
      // Only add if doesn't exist
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'products_sku_key'
          ) THEN
            ALTER TABLE products 
            ADD CONSTRAINT products_sku_key UNIQUE ("sku");
          END IF;
        END $$;
      `);
      console.log('✅ Added unique constraint for SKU');
    } catch (error) {
      console.log('⚠️  SKU constraint might already exist:', error.message);
    }

    // Verify the changes
    console.log('\n✅ Verifying columns...');
    const verifyColumns = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('hsnCode', 'gstRate', 'sku')
      ORDER BY column_name
    `, { type: QueryTypes.SELECT });

    console.log('\n📊 Product table GST columns:');
    console.table(verifyColumns);

    // Show sample of products table structure
    console.log('\n📋 Sample products with new fields:');
    const sampleProducts = await sequelize.query(`
      SELECT 
        id, 
        name, 
        "hsnCode", 
        "gstRate", 
        "sku",
        price
      FROM products 
      LIMIT 5
    `, { type: QueryTypes.SELECT });
    
    console.table(sampleProducts);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update existing products with HSN codes and GST rates');
    console.log('2. Set default HSN codes for product categories');
    console.log('3. Generate SKUs for existing products');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
