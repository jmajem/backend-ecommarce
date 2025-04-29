# E-Commerce Backend API Tests

This directory contains tests for the e-commerce backend API routes using Jest and Supertest.

## Running Tests

To run all tests in series (recommended):

```bash
npm test
```

To run a specific test file:

```bash
npm test -- tests/routes/user.test.js
```

## Test Structure

Tests are organized by route/feature:

```
tests/
├── helpers/              # Test helpers and utilities
│   ├── testApp.js        # Express app for testing
│   └── testEntities.js   # Test-specific entity definitions (if needed)
├── routes/               # API route tests
│   ├── user.test.js
│   ├── product.test.js
│   └── ...
├── setup.js              # Global test setup
└── README.md             # This file
```

## Writing Tests

### Test File Template

Each API route test file should follow this pattern:

```javascript
const request = require('supertest');
const { app, startTestServer } = require('../helpers/testApp');
const { TestDataSource } = require('../../src/config/database.test');
const Entity = require('../../src/entities/Entity');

let server;

describe('Feature Name', () => {
  let testData;
  let testId;
  let uniqueValue = `test-${Date.now()}`;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    server = startTestServer();
  });

  afterAll(async () => {
    await cleanUp();
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Create test data
  });

  afterEach(async () => {
    // Clean up test data
  });

  describe('GET /endpoint', () => {
    it('should return all items', async () => {
      // Test implementation
    });
  });

  describe('POST /endpoint', () => {
    it('should create a new item', async () => {
      // Test implementation
    });
  });

  // Additional tests for PATCH, DELETE, etc.
});
```

### Best Practices

1. **Use Unique Identifiers**: Always use unique identifiers (e.g., timestamps in email addresses) to avoid conflicts between test runs.

2. **Clean Up Test Data**: Always clean up your test data both before and after tests to ensure a clean state.

3. **Test Both Success and Error Cases**: Test both successful operations and error conditions.

4. **Mock Dependencies**: Mock or stub external dependencies.

5. **Run Tests In Band**: Run tests serially with `--runInBand` to avoid conflicts.

### Example: Testing a GET Route

```javascript
describe('GET /api/users/:id', () => {
  it('should return a single user by ID', async () => {
    const response = await request(app).get(`/api/users/${userId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id', userId);
    expect(response.body.data).toHaveProperty('email', testUserEmail);
  });

  it('should return 404 if user not found', async () => {
    const nonExistentId = 9999;
    const response = await request(app).get(`/api/users/${nonExistentId}`);
    
    expect(response.status).toBe(404);
  });
});
```

### Example: Testing a POST Route

```javascript
describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const newUser = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      phoneNumber: '987-654-3210'
    };
    
    const response = await request(app)
      .post('/api/users')
      .send(newUser);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('email', 'new@example.com');
    
    // Clean up the created user
    const userRepository = TestDataSource.getRepository(User);
    await userRepository.delete({ email: 'new@example.com' });
  });
});
```

## Troubleshooting

If tests are failing with database connection issues:

1. Make sure the database is running and accessible
2. Check the database credentials in `.env` file
3. Ensure there are no conflicting data from previous test runs