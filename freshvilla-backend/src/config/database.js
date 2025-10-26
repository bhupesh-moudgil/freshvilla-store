const { Sequelize } = require('sequelize');

// Environment-based database configuration
const ENV = process.env.DEPLOY_ENV || 'prod-github';

const dbConfig = {
  // GitHub deployment with Supabase
  'prod-github': {
    name: 'Supabase PostgreSQL',
    host: process.env.DB_HOST || 'db.inqbadybjwdracaplzwr.supabase.co',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'postgres',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  // Google Cloud VM with YugabyteDB
  'prod-gcp': {
    name: 'YugabyteDB',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'freshvilla',
    username: process.env.DB_USER || 'yugabyte',
    password: process.env.DB_PASSWORD || 'yugabyte',
    dialect: 'postgres',
    dialectOptions: {} // No SSL for local YugabyteDB
  }
};

// Get current environment config
const currentConfig = dbConfig[ENV];

if (!currentConfig) {
  console.error(`❌ Invalid DEPLOY_ENV: ${ENV}. Use 'prod-github' or 'prod-gcp'`);
  process.exit(1);
}

// Initialize Sequelize with current config
const sequelize = new Sequelize(
  currentConfig.database,
  currentConfig.username,
  currentConfig.password,
  {
    host: currentConfig.host,
    port: currentConfig.port,
    dialect: currentConfig.dialect,
    dialectOptions: currentConfig.dialectOptions,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000, // Increased to 60s for Render cold starts
      idle: 10000
    },
    retry: {
      max: 3,
      backoffBase: 1000,
      backoffExponent: 1.5
    }
  }
);

const connectDB = async () => {
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log(`\n🔌 Connecting to ${currentConfig.name}...`);
      console.log(`📍 Environment: ${ENV}`);
      console.log(`🌐 Host: ${currentConfig.host}:${currentConfig.port}`);
      console.log(`🔐 User: ${currentConfig.username}`);
      console.log(`📦 Database: ${currentConfig.database}`);
      console.log(`🔑 Password set: ${currentConfig.password ? 'Yes' : 'No'}`);
      console.log(`🔄 Retries remaining: ${retries}`);
      
      await sequelize.authenticate();
      console.log(`✅ ${currentConfig.name} Connected Successfully\n`);
      
      // Sync models (creates tables if they don't exist)
      await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
      console.log('📊 Database synced\n');
      
      return; // Success - exit function
      
    } catch (error) {
      retries--;
      console.error(`\n❌ Error connecting to ${currentConfig.name}:`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Name: ${error.name}`);
      
      if (retries > 0) {
        console.log(`   ⏳ Retrying in 5 seconds... (${retries} attempts left)\n`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error(`   Stack: ${error.stack}\n`);
        console.error('❌ All connection attempts failed. Exiting...\n');
        process.exit(1);
      }
    }
  }
};

module.exports = { connectDB, sequelize };
