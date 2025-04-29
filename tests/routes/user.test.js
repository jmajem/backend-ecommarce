const request = require('supertest');
const { app, startTestServer } = require('../helpers/testApp');
const { TestDataSource } = require('../../src/config/database.test');
const User = require('../../src/entities/User');

// Start server with a random port for testing
let server;

describe('User Routes', () => {
  let testUser;
  let userId;
  let testUserEmail = `test-${Date.now()}@example.com`; // Unique email to avoid conflicts

  beforeAll(async () => {
    // Ensure we're connected to the database
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    
    // Start the test server
    server = startTestServer();
  });

  // Helper function to clean up specific test users
  const removeTestUsers = async () => {
    try {
      const userRepository = TestDataSource.getRepository(User);
      await userRepository.delete({ email: testUserEmail });
      await userRepository.delete({ email: 'new@example.com' });
    } catch (error) {
      console.error('Error cleaning test users:', error);
    }
  };

  beforeEach(async () => {
    // Clean up any existing test users
    await removeTestUsers();
    
    // Create a test user before each test
    try {
      const userRepository = TestDataSource.getRepository(User);
      testUser = userRepository.create({
        email: testUserEmail,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '123-456-7890'
      });
      
      const savedUser = await userRepository.save(testUser);
      userId = savedUser.id;
    } catch (error) {
      console.error('Error creating test user:', error);
    }
  });

  afterEach(async () => {
    // Clean up test users after each test
    await removeTestUsers();
  });

  afterAll(async () => {
    // Final cleanup
    await removeTestUsers();
    
    // Close the test server
    if (server) {
      server.close();
    }
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      jest.setTimeout(10000); // 10 seconds timeout for this test
      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user by ID', async () => {
      const response = await request(app).get(`/api/users/${userId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', userId);
      expect(response.body.data).toHaveProperty('email', testUserEmail);
      expect(response.body.data).toHaveProperty('phoneNumber', '123-456-7890');
    });

    it('should return 404 if user not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/users/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

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
      expect(response.body.data).toHaveProperty('phoneNumber', '987-654-3210');
      
      // Clean up the created user right away to avoid conflicts
      const userRepository = TestDataSource.getRepository(User);
      await userRepository.delete({ email: 'new@example.com' });
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteUser = {
        email: 'incomplete@example.com'
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(incompleteUser);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update an existing user', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };
      
      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', userId);
      expect(response.body.data).toHaveProperty('firstName', 'Updated');
      expect(response.body.data).toHaveProperty('lastName', 'Name');
    });

    it('should return 404 if user to update not found', async () => {
      const nonExistentId = 9999;
      const updateData = { firstName: 'Updated' };
      
      const response = await request(app)
        .patch(`/api/users/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete an existing user', async () => {
      const response = await request(app)
        .delete(`/api/users/${userId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify user is deleted
      const findResponse = await request(app).get(`/api/users/${userId}`);
      expect(findResponse.status).toBe(404);
    });

    it('should return 404 if user to delete not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/users/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});