/**
 * Sync All Models Script
 * Creates all tables from models
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');

// Import all models
const Store = require('../src/models/Store');
const Customer = require('../src/models/Customer');
const Order = require('../src/models/Order');
const City = require('../src/models/City');
const Employee = require('../src/models/Employee');
const Warehouse = require('../src/models/Warehouse');
const ServiceArea = require('../src/models/ServiceArea');
const StoreUser = require('../src/models/StoreUser');
const Product = require('../src/models/Product');
const Admin = require('../src/models/Admin');
const Coupon = require('../src/models/Coupon');
const Banner = require('../src/models/Banner');
const Settings = require('../src/models/Settings');
const InternalInvoice = require('../src/models/InternalInvoice');
const InternalInvoiceItem = require('../src/models/InternalInvoiceItem');
const InternalTransfer = require('../src/models/InternalTransfer');
const InternalTransferItem = require('../src/models/InternalTransferItem');
const WarehouseInventory = require('../src/models/WarehouseInventory');
const StoreFinancials = require('../src/models/StoreFinancials');
const LoyaltyProgram = require('../src/models/LoyaltyProgram');
const LoyaltyTier = require('../src/models/LoyaltyTier');
const LoyaltyRule = require('../src/models/LoyaltyRule');
const CustomerLoyalty = require('../src/models/CustomerLoyalty');
const LoyaltyPointLedger = require('../src/models/LoyaltyPointLedger');
const LoyaltyCoupon = require('../src/models/LoyaltyCoupon');
const CreditNote = require('../src/models/CreditNote');
const GSTLedger = require('../src/models/GSTLedger');
const GSTSummary = require('../src/models/GSTSummary');

async function syncAllModels() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully!\n');

    console.log('📋 Syncing all models (creating/updating tables)...\n');
    
    // Setup associations first
    try {
      const { setupAssociations } = require('../src/models/associations');
      setupAssociations();
      console.log('✅ Associations set up\n');
    } catch (err) {
      console.log('⚠️  Associations setup skipped:', err.message, '\n');
    }

    // Sync all models with alter: true to update existing tables
    await sequelize.sync({ alter: true });
    
    console.log('✅ All models synced successfully!\n');

    // List all tables
    const [tables] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log(`📊 Total tables: ${tables.length}\n`);
    console.log('Tables created:');
    tables.forEach(t => console.log(`   - ${t.tablename}`));
    
    console.log('\n✅ Database is ready for migrations!\n');

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed\n');
  }
}

// Run sync
if (require.main === module) {
  syncAllModels()
    .then(() => {
      console.log('✅ Sync complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncAllModels };
