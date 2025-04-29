const { TestDataSource } = require('../src/config/database.test');

// Mock environment to test mode
process.env.NODE_ENV = 'test';

// Global setup for all tests
beforeAll(async () => {
  jest.setTimeout(60000); // 60 seconds timeout
  
  try {
    // Initialize database
    await TestDataSource.initialize();
    console.log('Test database connected');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    // Don't exit the process, but log the error
    console.error('Tests will likely fail due to database connection issue');
  }
});

// Global teardown for all tests
afterAll(async () => {
  if (TestDataSource.isInitialized) {
    await TestDataSource.destroy();
    console.log('Test database connection closed');
  }
});