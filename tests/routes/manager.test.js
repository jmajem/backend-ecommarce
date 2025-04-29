const request = require('supertest');
const app = require('../../src/app');
const { AppDataSource } = require('../../src/config/database');
const Manager = require('../../src/entities/Manager');

describe('Manager Routes', () => {
  let testManager;
  let managerId;

  beforeAll(async () => {
    // Clear managers to ensure test isolation
    await AppDataSource.getRepository(Manager).clear();
  });

  beforeEach(async () => {
    // Create a test manager before each test
    const managerRepository = AppDataSource.getRepository(Manager);
    testManager = managerRepository.create({
      username: 'testmanager',
      email: 'manager@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Manager',
      role: 'admin',
      department: 'IT'
    });
    
    const savedManager = await managerRepository.save(testManager);
    managerId = savedManager.id;
  });

  afterEach(async () => {
    // Clear managers after each test
    await AppDataSource.getRepository(Manager).clear();
  });

  describe('GET /api/managers', () => {
    it('should return all managers', async () => {
      const response = await request(app).get('/api/managers');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/managers/:id', () => {
    it('should return a single manager by ID', async () => {
      const response = await request(app).get(`/api/managers/${managerId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', managerId);
      expect(response.body.data).toHaveProperty('username', 'testmanager');
      expect(response.body.data).toHaveProperty('email', 'manager@example.com');
      expect(response.body.data).toHaveProperty('role', 'admin');
    });

    it('should return 404 if manager not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/managers/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/managers', () => {
    it('should create a new manager', async () => {
      const newManager = {
        username: 'newmanager',
        email: 'new.manager@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Manager',
        role: 'moderator',
        department: 'Sales'
      };
      
      const response = await request(app)
        .post('/api/managers')
        .send(newManager);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username', 'newmanager');
      expect(response.body.data).toHaveProperty('email', 'new.manager@example.com');
      expect(response.body.data).toHaveProperty('role', 'moderator');
      expect(response.body.data).toHaveProperty('department', 'Sales');
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteManager = {
        username: 'incomplete'
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/managers')
        .send(incompleteManager);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/managers/:id', () => {
    it('should update an existing manager', async () => {
      const updateData = {
        role: 'super-admin',
        department: 'Executive'
      };
      
      const response = await request(app)
        .patch(`/api/managers/${managerId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', managerId);
      expect(response.body.data).toHaveProperty('role', 'super-admin');
      expect(response.body.data).toHaveProperty('department', 'Executive');
    });

    it('should return 404 if manager to update not found', async () => {
      const nonExistentId = 9999;
      const updateData = { role: 'editor' };
      
      const response = await request(app)
        .patch(`/api/managers/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/managers/:id', () => {
    it('should delete an existing manager', async () => {
      const response = await request(app)
        .delete(`/api/managers/${managerId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify manager is deleted
      const findResponse = await request(app).get(`/api/managers/${managerId}`);
      expect(findResponse.status).toBe(404);
    });

    it('should return 404 if manager to delete not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/managers/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});