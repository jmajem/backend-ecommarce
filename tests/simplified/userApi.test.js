const request = require('supertest');
const express = require('express');
const { TestDataSource } = require('../../src/config/database.test');
const { UserTest } = require('../helpers/testEntities');

// Create a simplified Express app for testing
const app = express();
app.use(express.json());

// Create a simple user controller and route
const userController = {
  createUser: async (req, res) => {
    try {
      const userRepository = TestDataSource.getRepository(UserTest);
      const user = userRepository.create(req.body);
      const result = await userRepository.save(user);
      
      res.status(201).json({ 
        status: 'success', 
        data: result 
      });
    } catch (error) {
      res.status(400).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  },
  
  getAllUsers: async (req, res) => {
    try {
      const userRepository = TestDataSource.getRepository(UserTest);
      const users = await userRepository.find();
      
      res.status(200).json({ 
        status: 'success', 
        data: users 
      });
    } catch (error) {
      res.status(400).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }
};

// Simple routes
app.post('/api/users', userController.createUser);
app.get('/api/users', userController.getAllUsers);

describe('User API Tests', () => {
  beforeAll(async () => {
    await TestDataSource.initialize();
    await TestDataSource.synchronize(true);
  });

  afterAll(async () => {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }
  });

  afterEach(async () => {
    // Clean up users after each test
    const userRepository = TestDataSource.getRepository(UserTest);
    await userRepository.clear();
  });

  it('should create a user via API', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'api-test@example.com',
      password: 'password123',
      phoneNumber: '123-456-7890'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('firstName', 'Test');
    expect(response.body.data).toHaveProperty('lastName', 'User');
    expect(response.body.data).toHaveProperty('email', 'api-test@example.com');
    expect(response.body.data).toHaveProperty('phoneNumber', '123-456-7890');
  });

  it('should get all users via API', async () => {
    // First create a user
    const userRepository = TestDataSource.getRepository(UserTest);
    const testUser = userRepository.create({
      firstName: 'Get',
      lastName: 'AllUser',
      email: 'get-all@example.com',
      password: 'password123',
      phoneNumber: '555-555-5555'
    });
    
    await userRepository.save(testUser);
    
    // Now test getting all users
    const response = await request(app).get('/api/users');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toHaveProperty('email', 'get-all@example.com');
  });
});