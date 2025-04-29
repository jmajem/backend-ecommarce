const request = require('supertest');
const app = require('../../src/app');
const { AppDataSource } = require('../../src/config/database');
const Seller = require('../../src/entities/Seller');

describe('Seller Routes', () => {
  let testSeller;
  let sellerId;

  beforeAll(async () => {
    // Clear sellers to ensure test isolation
    await AppDataSource.getRepository(Seller).clear();
  });

  beforeEach(async () => {
    // Create a test seller before each test
    const sellerRepository = AppDataSource.getRepository(Seller);
    testSeller = sellerRepository.create({
      username: 'testseller',
      email: 'seller@example.com',
      password: 'password123',
      companyName: 'Test Company',
      contactPhone: '123-456-7890',
      businessAddress: '123 Business St'
    });
    
    const savedSeller = await sellerRepository.save(testSeller);
    sellerId = savedSeller.id;
  });

  afterEach(async () => {
    // Clear sellers after each test
    await AppDataSource.getRepository(Seller).clear();
  });

  describe('GET /api/sellers', () => {
    it('should return all sellers', async () => {
      const response = await request(app).get('/api/sellers');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/sellers/:id', () => {
    it('should return a single seller by ID', async () => {
      const response = await request(app).get(`/api/sellers/${sellerId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', sellerId);
      expect(response.body.data).toHaveProperty('username', 'testseller');
      expect(response.body.data).toHaveProperty('email', 'seller@example.com');
    });

    it('should return 404 if seller not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/sellers/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/sellers', () => {
    it('should create a new seller', async () => {
      const newSeller = {
        username: 'newseller',
        email: 'new.seller@example.com',
        password: 'password123',
        companyName: 'New Company',
        contactPhone: '987-654-3210',
        businessAddress: '456 New Business Ave'
      };
      
      const response = await request(app)
        .post('/api/sellers')
        .send(newSeller);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username', 'newseller');
      expect(response.body.data).toHaveProperty('email', 'new.seller@example.com');
      expect(response.body.data).toHaveProperty('companyName', 'New Company');
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteSeller = {
        username: 'incomplete'
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/sellers')
        .send(incompleteSeller);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/sellers/:id', () => {
    it('should update an existing seller', async () => {
      const updateData = {
        companyName: 'Updated Company',
        contactPhone: '555-555-5555'
      };
      
      const response = await request(app)
        .patch(`/api/sellers/${sellerId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', sellerId);
      expect(response.body.data).toHaveProperty('companyName', 'Updated Company');
      expect(response.body.data).toHaveProperty('contactPhone', '555-555-5555');
    });

    it('should return 404 if seller to update not found', async () => {
      const nonExistentId = 9999;
      const updateData = { companyName: 'Updated Name' };
      
      const response = await request(app)
        .patch(`/api/sellers/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sellers/:id', () => {
    it('should delete an existing seller', async () => {
      const response = await request(app)
        .delete(`/api/sellers/${sellerId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify seller is deleted
      const findResponse = await request(app).get(`/api/sellers/${sellerId}`);
      expect(findResponse.status).toBe(404);
    });

    it('should return 404 if seller to delete not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/sellers/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});