/**
 * Set default HSN codes and GST rates for existing products by category
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
    logging: false
  }
);

// Default HSN codes and GST rates for common categories
const categoryDefaults = {
  'Groceries': {
    hsnCode: '1001',
    gstRate: 5,
    description: 'Food grains - Wheat, Rice, etc.'
  },
  'Fruits & Vegetables': {
    hsnCode: '0701',
    gstRate: 0,
    description: 'Fresh fruits and vegetables'
  },
  'Dairy & Eggs': {
    hsnCode: '0401',
    gstRate: 5,
    description: 'Milk and dairy products'
  },
  'Snacks & Beverages': {
    hsnCode: '2202',
    gstRate: 12,
    description: 'Beverages and snacks'
  },
  'Bakery': {
    hsnCode: '1905',
    gstRate: 18,
    description: 'Bakery products'
  },
  'Personal Care': {
    hsnCode: '3304',
    gstRate: 18,
    description: 'Beauty and personal care products'
  },
  'Household': {
    hsnCode: '3402',
    gstRate: 18,
    description: 'Household cleaning products'
  },
  'Others': {
    hsnCode: '9999',
    gstRate: 18,
    description: 'Other products'
  }
};

async function setDefaultHSNAndGST() {
  try {
    console.log('🔌 Connecting to Supabase...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully!\n');

    console.log('📋 Setting default HSN codes and GST rates by category\n');

    // Get product count by category
    const categoryCounts = await sequelize.query(`
      SELECT category, COUNT(*) as count
      FROM products
      GROUP BY category
      ORDER BY category
    `, { type: QueryTypes.SELECT });

    console.log('📊 Products by category:');
    console.table(categoryCounts);

    let totalUpdated = 0;

    // Update each category
    for (const [category, defaults] of Object.entries(categoryDefaults)) {
      console.log(`\n🔄 Updating category: ${category}`);
      console.log(`   HSN Code: ${defaults.hsnCode}`);
      console.log(`   GST Rate: ${defaults.gstRate}%`);
      console.log(`   Description: ${defaults.description}`);

      const [results] = await sequelize.query(`
        UPDATE products
        SET 
          "hsnCode" = :hsnCode,
          "gstRate" = :gstRate,
          "updatedAt" = NOW()
        WHERE category = :category
        AND ("hsnCode" IS NULL OR "hsnCode" = '')
        RETURNING id, name, category
      `, {
        replacements: {
          hsnCode: defaults.hsnCode,
          gstRate: defaults.gstRate,
          category: category
        }
      });

      if (results && results.length > 0) {
        console.log(`   ✅ Updated ${results.length} products`);
        totalUpdated += results.length;
      } else {
        console.log(`   ⏭️  No products to update (already have HSN codes)`);
      }
    }

    // Generate SKUs for products without them
    console.log('\n\n🔢 Generating SKUs for products...');
    const productsWithoutSKU = await sequelize.query(`
      SELECT id, name, category
      FROM products
      WHERE "sku" IS NULL OR "sku" = ''
      ORDER BY category, name
    `, { type: QueryTypes.SELECT });

    console.log(`Found ${productsWithoutSKU.length} products without SKU`);

    if (productsWithoutSKU.length > 0) {
      let skuCount = 0;
      
      for (const product of productsWithoutSKU) {
        // Generate SKU: Category prefix + sequential number
        const categoryPrefix = getCategoryPrefix(product.category);
        skuCount++;
        const sku = `${categoryPrefix}-${String(skuCount).padStart(5, '0')}`;

        await sequelize.query(`
          UPDATE products
          SET "sku" = :sku, "updatedAt" = NOW()
          WHERE id = :id
        `, {
          replacements: { sku, id: product.id }
        });

        if (skuCount <= 5) {
          console.log(`   Generated: ${sku} for "${product.name}"`);
        }
      }
      
      if (productsWithoutSKU.length > 5) {
        console.log(`   ... and ${productsWithoutSKU.length - 5} more`);
      }
      console.log(`✅ Generated ${productsWithoutSKU.length} SKUs`);
    }

    // Verify updates
    console.log('\n\n📊 Verification Summary:');
    const summary = await sequelize.query(`
      SELECT 
        category,
        "hsnCode",
        "gstRate",
        COUNT(*) as product_count
      FROM products
      GROUP BY category, "hsnCode", "gstRate"
      ORDER BY category, "gstRate"
    `, { type: QueryTypes.SELECT });

    console.table(summary);

    // Show sample products
    console.log('\n📋 Sample products with HSN and GST:');
    const samples = await sequelize.query(`
      SELECT 
        name,
        category,
        "sku",
        "hsnCode",
        "gstRate",
        price
      FROM products
      ORDER BY category
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    console.table(samples);

    console.log(`\n✅ Total products updated: ${totalUpdated}`);
    console.log('✅ Default HSN codes and GST rates set successfully!');

  } catch (error) {
    console.error('\n❌ Failed to set defaults:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Helper function to get category prefix for SKU
function getCategoryPrefix(category) {
  const prefixes = {
    'Groceries': 'GRO',
    'Fruits & Vegetables': 'FRV',
    'Dairy & Eggs': 'DRY',
    'Snacks & Beverages': 'SNK',
    'Bakery': 'BKY',
    'Personal Care': 'PER',
    'Household': 'HSH',
    'Others': 'OTH'
  };
  return prefixes[category] || 'PRD';
}

// Run script
if (require.main === module) {
  setDefaultHSNAndGST()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { setDefaultHSNAndGST, categoryDefaults };
