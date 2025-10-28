/**
 * Migration: Update Store URLs with storeType Prefix
 * 
 * This migration updates existing store URLs to include the storeType prefix:
 * - 'br-' for brand stores (FreshVilla owned)
 * - 'int-' for integrated stores (3rd party partnerships)
 * 
 * Old format: dl-ndl-001
 * New format: br-dl-ndl-001 or int-mh-mum-001
 * 
 * IMPORTANT: Run this AFTER the comprehensive-structure-upgrade.js migration
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

/**
 * Check if store URL already has type prefix
 */
function hasTypePrefix(storeUrl) {
  return /^(br|int)-/.test(storeUrl);
}

/**
 * Add type prefix to store URL based on storeType
 */
function addTypePrefix(storeUrl, storeType) {
  if (hasTypePrefix(storeUrl)) {
    return storeUrl; // Already has prefix
  }
  
  const prefix = storeType === 'integrated' ? 'int' : 'br';
  return `${prefix}-${storeUrl}`;
}

async function runMigration() {
  const t = await sequelize.transaction();
  
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully!\n');

    console.log('📋 Starting Store URL Update Migration\n');
    console.log('='.repeat(60));

    // ============================================
    // 1. FETCH ALL STORES
    // ============================================
    console.log('\n📦 1. Fetching all stores...');
    
    const stores = await sequelize.query(`
      SELECT id, "storeUrl", "storeType", name, city, state
      FROM stores
      ORDER BY "createdAt"
    `, { 
      type: QueryTypes.SELECT,
      transaction: t 
    });
    
    console.log(`   Found ${stores.length} stores\n`);

    // ============================================
    // 2. UPDATE STORE URLs
    // ============================================
    console.log('🔄 2. Updating Store URLs...\n');
    
    let updatedCount = 0;
    let skippedCount = 0;
    const updates = [];
    
    for (const store of stores) {
      const oldUrl = store.storeUrl;
      const storeType = store.storeType || 'brand';
      
      if (hasTypePrefix(oldUrl)) {
        console.log(`   ⏭️  Skipped: ${store.name} - URL already has prefix (${oldUrl})`);
        skippedCount++;
        continue;
      }
      
      const newUrl = addTypePrefix(oldUrl, storeType);
      
      // Update in database
      await sequelize.query(`
        UPDATE stores 
        SET "storeUrl" = :newUrl
        WHERE id = :id
      `, {
        replacements: { id: store.id, newUrl },
        transaction: t
      });
      
      updates.push({
        name: store.name,
        location: `${store.city}, ${store.state}`,
        type: storeType,
        oldUrl,
        newUrl
      });
      
      console.log(`   ✅ ${store.name}: ${oldUrl} → ${newUrl}`);
      updatedCount++;
    }

    // ============================================
    // 3. VERIFY UNIQUENESS
    // ============================================
    console.log('\n🔍 3. Verifying URL Uniqueness...');
    
    const duplicates = await sequelize.query(`
      SELECT "storeUrl", COUNT(*) as count
      FROM stores
      GROUP BY "storeUrl"
      HAVING COUNT(*) > 1
    `, { 
      type: QueryTypes.SELECT,
      transaction: t 
    });
    
    if (duplicates.length > 0) {
      console.error('   ❌ Found duplicate URLs:');
      duplicates.forEach(dup => {
        console.error(`      - ${dup.storeUrl}: ${dup.count} occurrences`);
      });
      throw new Error('Duplicate store URLs detected! Rolling back...');
    }
    
    console.log('   ✅ All URLs are unique');

    // ============================================
    // 4. VALIDATE URL FORMAT
    // ============================================
    console.log('\n✅ 4. Validating URL Formats...');
    
    const invalidUrls = await sequelize.query(`
      SELECT id, name, "storeUrl"
      FROM stores
      WHERE "storeUrl" !~ '^(br|int)-[a-z]{2}-[a-z]{2,5}-\\d{3}$'
    `, { 
      type: QueryTypes.SELECT,
      transaction: t 
    });
    
    if (invalidUrls.length > 0) {
      console.error('   ❌ Found invalid URL formats:');
      invalidUrls.forEach(store => {
        console.error(`      - ${store.name}: ${store.storeUrl}`);
      });
      throw new Error('Invalid store URLs detected! Rolling back...');
    }
    
    console.log('   ✅ All URLs match expected format');

    // ============================================
    // COMMIT TRANSACTION
    // ============================================
    await t.commit();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration Completed Successfully!\n');
    
    // ============================================
    // SUMMARY
    // ============================================
    console.log('📊 Migration Summary:\n');
    console.log(`   Total Stores: ${stores.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped (already had prefix): ${skippedCount}`);
    
    if (updates.length > 0) {
      console.log('\n📝 Updated Store URLs:\n');
      updates.forEach(update => {
        const typeLabel = update.type === 'brand' ? '🏢 Brand' : '🤝 Integrated';
        console.log(`   ${typeLabel} - ${update.name} (${update.location})`);
        console.log(`      ${update.oldUrl} → ${update.newUrl}\n`);
      });
    }
    
    console.log('\n✅ All store URLs have been successfully updated!\n');

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
