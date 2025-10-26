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
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    console.log(`\n🔌 Connecting to ${currentConfig.name}...`);
    console.log(`📍 Environment: ${ENV}`);
    console.log(`🌐 Host: ${currentConfig.host}:${currentConfig.port}`);
    console.log(`🔐 User: ${currentConfig.username}`);
    console.log(`📦 Database: ${currentConfig.database}`);
    console.log(`🔑 Password set: ${currentConfig.password ? 'Yes' : 'No'}`);
    
    await sequelize.authenticate();
    console.log(`✅ ${currentConfig.name} Connected Successfully\n`);
    
    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('📊 Database synced\n');
    
  } catch (error) {
    console.error(`\n❌ Error connecting to ${currentConfig.name}:`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Name: ${error.name}`);
    console.error(`   Stack: ${error.stack}\n`);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };
