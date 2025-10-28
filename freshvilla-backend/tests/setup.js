const { sequelize } = require('../src/config/database');

// Setup before all tests
beforeAll(async () => {
  // Connect to test database
  await sequelize.authenticate();
  console.log('Test database connected');
});

// Cleanup after all tests
afterAll(async () => {
  await sequelize.close();
  console.log('Test database connection closed');
});

// Clear database before each test suite
beforeEach(async () => {
  // Optionally truncate tables or use transactions
});
