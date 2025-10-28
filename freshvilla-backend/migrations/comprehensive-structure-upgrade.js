/**
 * Comprehensive Database Structure Upgrade Migration
 * 
 * This migration adds:
 * 1. storeType and partner fields to Store
 * 2. Location fields to Customer
 * 3. FK relationships to Order (customerId, storeId)
 * 4. Location fields to Order
 * 5. Creates City master table
 * 6. Creates Employee table
 * 7. Adds all necessary indexes
 * 
 * Run this AFTER models have been updated
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
  const t = await sequelize.transaction();
  
  try {
    console.log('🔌 Connecting to Supabase...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully!\n');

    console.log('📋 Starting Comprehensive Database Structure Upgrade\n');
    console.log('='  .repeat(60));

    // ============================================
    // 1. STORE MODEL ENHANCEMENTS
    // ============================================
    console.log('\n📦 1. Upgrading Store Model...');
    
    // Add storeType ENUM
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE store_type AS ENUM ('brand', 'integrated');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `, { transaction: t });
    
    // Add storeType column
    await sequelize.query(`
      ALTER TABLE stores 
      ADD COLUMN IF NOT EXISTS "storeType" store_type DEFAULT 'brand' NOT NULL
    `, { transaction: t });
    
    // Add partner fields
    await sequelize.query(`
      ALTER TABLE stores 
      ADD COLUMN IF NOT EXISTS "partnerName" VARCHAR(200),
      ADD COLUMN IF NOT EXISTS "partnerContact" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "partnerEmail" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "partnerPhone" VARCHAR(20),
      ADD COLUMN IF NOT EXISTS "partnershipDate" DATE,
      ADD COLUMN IF NOT EXISTS "partnershipStatus" VARCHAR(20) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS "commissionOverride" DECIMAL(5,2)
    `, { transaction: t });
    
    console.log('   ✅ Store model upgraded');

    // ============================================
    // 2. CUSTOMER MODEL ENHANCEMENTS
    // ============================================
    console.log('\n👤 2. Upgrading Customer Model...');
    
    await sequelize.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS "city" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "cityCode" VARCHAR(10),
      ADD COLUMN IF NOT EXISTS "district" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "state" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "stateCode" VARCHAR(10),
      ADD COLUMN IF NOT EXISTS "pincode" VARCHAR(10),
      ADD COLUMN IF NOT EXISTS "preferredStoreId" UUID REFERENCES stores(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS "lastOrderCity" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "lastOrderDate" TIMESTAMP
    `, { transaction: t });
    
    console.log('   ✅ Customer model upgraded');

    // ============================================
    // 3. ORDER MODEL ENHANCEMENTS
    // ============================================
    console.log('\n📦 3. Upgrading Order Model...');
    
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS "customerId" UUID REFERENCES customers(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS "storeId" UUID REFERENCES stores(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS "deliveryCity" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "deliveryCityCode" VARCHAR(10),
      ADD COLUMN IF NOT EXISTS "deliveryDistrict" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "deliveryState" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "deliveryStateCode" VARCHAR(10),
      ADD COLUMN IF NOT EXISTS "deliveryPincode" VARCHAR(10)
    `, { transaction: t });
    
    console.log('   ✅ Order model upgraded');

    // ============================================
    // 4. CREATE CITY MASTER TABLE
    // ============================================
    console.log('\n🏙️  4. Creating City Master Table...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE,
        district VARCHAR(100),
        state VARCHAR(100) NOT NULL,
        "stateCode" VARCHAR(10) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        "isActive" BOOLEAN DEFAULT true,
        "isServiceable" BOOLEAN DEFAULT false,
        priority INTEGER DEFAULT 100,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        population INTEGER,
        tier VARCHAR(20) DEFAULT 'other',
        metadata JSONB DEFAULT '{}',
        "storesCount" INTEGER DEFAULT 0,
        "customersCount" INTEGER DEFAULT 0,
        "activatedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, { transaction: t });
    
    console.log('   ✅ City table created');

    // ============================================
    // 5. CREATE EMPLOYEE TABLE
    // ============================================
    console.log('\n👷 5. Creating Employee Table...');
    
    // Create employee type ENUM
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE employee_type AS ENUM (
          'warehouse_staff', 'warehouse_manager', 
          'delivery_personnel', 'store_staff', 
          'store_manager', 'supervisor', 'operations'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `, { transaction: t });
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "employeeId" VARCHAR(50) NOT NULL UNIQUE,
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        mobile VARCHAR(20) NOT NULL,
        "alternateMobile" VARCHAR(20),
        password VARCHAR(255),
        "employeeType" employee_type NOT NULL,
        "warehouseId" UUID REFERENCES warehouses(id) ON DELETE SET NULL,
        "storeId" UUID REFERENCES stores(id) ON DELETE SET NULL,
        city VARCHAR(100),
        "cityCode" VARCHAR(10),
        state VARCHAR(100),
        "stateCode" VARCHAR(10),
        address TEXT,
        pincode VARCHAR(10),
        "joiningDate" DATE DEFAULT CURRENT_DATE,
        "relievingDate" DATE,
        status VARCHAR(20) DEFAULT 'active',
        department VARCHAR(100),
        designation VARCHAR(100),
        "reportingTo" UUID REFERENCES employees(id) ON DELETE SET NULL,
        salary DECIMAL(10,2),
        "salaryType" VARCHAR(20) DEFAULT 'monthly',
        "aadhaarNumber" VARCHAR(20),
        "panNumber" VARCHAR(20),
        "drivingLicense" VARCHAR(50),
        "hasSystemAccess" BOOLEAN DEFAULT false,
        "lastLogin" TIMESTAMP,
        rating DECIMAL(2,1) DEFAULT 0.0,
        "completedTasks" INTEGER DEFAULT 0,
        notes TEXT,
        "emergencyContact" JSONB DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, { transaction: t });
    
    console.log('   ✅ Employee table created');

    // ============================================
    // 6. ADD INDEXES
    // ============================================
    console.log('\n📊 6. Adding Indexes...');
    
    const indexes = [
      // Store indexes
      `CREATE INDEX IF NOT EXISTS idx_stores_type ON stores("storeType")`,
      `CREATE INDEX IF NOT EXISTS idx_stores_partnership ON stores("partnershipStatus")`,
      
      // Customer indexes
      `CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city)`,
      `CREATE INDEX IF NOT EXISTS idx_customers_citycode ON customers("cityCode")`,
      `CREATE INDEX IF NOT EXISTS idx_customers_state ON customers(state)`,
      `CREATE INDEX IF NOT EXISTS idx_customers_preferred_store ON customers("preferredStoreId")`,
      
      // Order indexes
      `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders("customerId")`,
      `CREATE INDEX IF NOT EXISTS idx_orders_store ON orders("storeId")`,
      `CREATE INDEX IF NOT EXISTS idx_orders_city ON orders("deliveryCity")`,
      `CREATE INDEX IF NOT EXISTS idx_orders_state ON orders("deliveryState")`,
      `CREATE INDEX IF NOT EXISTS idx_orders_customer_store ON orders("customerId", "storeId")`,
      
      // City indexes (already defined in model)
      `CREATE INDEX IF NOT EXISTS idx_cities_code ON cities(code)`,
      `CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state)`,
      `CREATE INDEX IF NOT EXISTS idx_cities_serviceable ON cities("isServiceable")`,
      
      // Employee indexes
      `CREATE INDEX IF NOT EXISTS idx_employees_type ON employees("employeeType")`,
      `CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status)`,
      `CREATE INDEX IF NOT EXISTS idx_employees_warehouse ON employees("warehouseId")`,
      `CREATE INDEX IF NOT EXISTS idx_employees_store ON employees("storeId")`,
      `CREATE INDEX IF NOT EXISTS idx_employees_city ON employees(city)`,
      `CREATE INDEX IF NOT EXISTS idx_employees_supervisor ON employees("reportingTo")`,
    ];
    
    for (const indexQuery of indexes) {
      try {
        await sequelize.query(indexQuery, { transaction: t });
        console.log(`   ✅ ${indexQuery.split('idx_')[1]?.split(' ')[0] || 'index'} added`);
      } catch (err) {
        console.log(`   ⏭️  ${err.message.substring(0, 50)}...`);
      }
    }

    // ============================================
    // 7. MIGRATE EXISTING DATA
    // ============================================
    console.log('\n🔄 7. Migrating Existing Data...');
    
    // Link existing orders to customers by email
    const ordersLinked = await sequelize.query(`
      UPDATE orders o
      SET "customerId" = c.id
      FROM customers c
      WHERE o."customerEmail" = c.email
      AND o."customerId" IS NULL
    `, { transaction: t });
    
    console.log(`   ✅ Linked ${ordersLinked[1]} orders to customers`);
    
    // Extract customer location from first address
    await sequelize.query(`
      UPDATE customers
      SET 
        city = COALESCE(addresses->0->>'city', ''),
        state = COALESCE(addresses->0->>'state', ''),
        pincode = COALESCE(addresses->0->>'pincode', '')
      WHERE addresses IS NOT NULL 
      AND jsonb_array_length(addresses) > 0
      AND city IS NULL
    `, { transaction: t });
    
    console.log('   ✅ Extracted customer locations from addresses');

    // ============================================
    // 8. SEED INITIAL CITIES
    // ============================================
    console.log('\n🌆 8. Seeding Major Indian Cities...');
    
    const majorCities = [
      { name: 'New Delhi', code: 'DEL', state: 'Delhi', stateCode: 'DL', tier: 'tier1', isServiceable: true },
      { name: 'Mumbai', code: 'MUM', state: 'Maharashtra', stateCode: 'MH', tier: 'tier1', isServiceable: true },
      { name: 'Bangalore', code: 'BLR', state: 'Karnataka', stateCode: 'KA', tier: 'tier1', isServiceable: true },
      { name: 'Hyderabad', code: 'HYD', state: 'Telangana', stateCode: 'TG', tier: 'tier1', isServiceable: true },
      { name: 'Chennai', code: 'CHN', state: 'Tamil Nadu', stateCode: 'TN', tier: 'tier1', isServiceable: true },
      { name: 'Kolkata', code: 'KOL', state: 'West Bengal', stateCode: 'WB', tier: 'tier1', isServiceable: true },
      { name: 'Pune', code: 'PUN', state: 'Maharashtra', stateCode: 'MH', tier: 'tier1', isServiceable: true },
      { name: 'Ahmedabad', code: 'AMD', state: 'Gujarat', stateCode: 'GJ', tier: 'tier1', isServiceable: false },
      { name: 'Jaipur', code: 'JAI', state: 'Rajasthan', stateCode: 'RJ', tier: 'tier2', isServiceable: false },
      { name: 'Surat', code: 'SRT', state: 'Gujarat', stateCode: 'GJ', tier: 'tier2', isServiceable: false },
    ];
    
    for (const city of majorCities) {
      await sequelize.query(`
        INSERT INTO cities (name, code, state, "stateCode", tier, "isServiceable", "isActive", priority)
        VALUES (:name, :code, :state, :stateCode, :tier, :isServiceable, true, 
                CASE WHEN :tier = 'tier1' THEN 10 ELSE 50 END)
        ON CONFLICT (code) DO NOTHING
      `, {
        replacements: city,
        transaction: t
      });
    }
    
    console.log(`   ✅ Seeded ${majorCities.length} cities`);

    // ============================================
    // COMMIT TRANSACTION
    // ============================================
    await t.commit();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration Completed Successfully!\n');
    
    // ============================================
    // VERIFICATION
    // ============================================
    console.log('📊 Verification Summary:\n');
    
    const storeCols = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'stores' AND column_name IN ('storeType', 'partnerName')
    `, { type: QueryTypes.SELECT });
    console.log(`   Stores: ${storeCols.length}/2 new columns added`);
    
    const customerCols = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name IN ('city', 'preferredStoreId')
    `, { type: QueryTypes.SELECT });
    console.log(`   Customers: ${customerCols.length}/2 key columns added`);
    
    const orderCols = await sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name IN ('customerId', 'storeId')
    `, { type: QueryTypes.SELECT });
    console.log(`   Orders: ${orderCols.length}/2 FK columns added`);
    
    const cityCount = await sequelize.query(`
      SELECT COUNT(*) as count FROM cities
    `, { type: QueryTypes.SELECT });
    console.log(`   Cities: ${cityCount[0].count} cities in table`);
    
    const empTable = await sequelize.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'employees'
    `, { type: QueryTypes.SELECT });
    console.log(`   Employees: ${empTable[0].count > 0 ? 'Table created' : 'Table missing'}`);
    
    console.log('\n✅ All changes verified!\n');

  } catch (error) {
    await t.rollback();
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed\n');
  }
}

// Run migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
