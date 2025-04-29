const request = require('supertest');
const app = require('../../src/app');
const { AppDataSource } = require('../../src/config/database');
const Store = require('../../src/entities/Store');
const Seller = require('../../src/entities/Seller');

describe('Store Routes', () => {
  let testSeller;
  let testStore;
  let storeId;

  beforeAll(async () => {
    // Create test seller
    const sellerRepo = AppDataSource.getRepository(Seller);
    testSeller = sellerRepo.create({
      username: 'storeTestSeller',
      email: 'storeseller@example.com',
      password: 'password123',
      companyName: 'Store Test Company'
    });
    await sellerRepo.save(testSeller);

    // Clear stores to ensure test isolation
    await AppDataSource.getRepository(Store).clear();
  });

  beforeEach(async () => {
    // Create a test store before each test
    const storeRepository = AppDataSource.getRepository(Store);
    testStore = storeRepository.create({
      name: 'Test Store',
      description: 'Test store description',
      seller: testSeller,
      logoUrl: 'https://example.com/logo.png',
      bannerUrl: 'https://example.com/banner.png',
      address: '123 Store St',
      contactEmail: 'store@example.com',
      contactPhone: '123-456-7890'
    });
    
    const savedStore = await storeRepository.save(testStore);
    storeId = savedStore.id;
  });

  afterEach(async () => {
    // Clear stores after each test
    await AppDataSource.getRepository(Store).clear();
  });

  afterAll(async () => {
    // Clean up test data
    await AppDataSource.getRepository(Seller).delete({ id: testSeller.id });
  });

  describe('GET /api/stores', () => {
    it('should return all stores', async () => {
      const response = await request(app).get('/api/stores');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/stores/:id', () => {
    it('should return a single store by ID', async () => {
      const response = await request(app).get(`/api/stores/${storeId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', storeId);
      expect(response.body.data).toHaveProperty('name', 'Test Store');
      expect(response.body.data).toHaveProperty('description', 'Test store description');
    });

    it('should return 404 if store not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/stores/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/stores/seller/:sellerId', () => {
    it('should return all stores for a specific seller', async () => {
      const response = await request(app).get(`/api/stores/seller/${testSeller.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('seller');
      expect(response.body.data[0].seller).toHaveProperty('id', testSeller.id);
    });

    it('should return empty array if seller has no stores', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/stores/seller/${nonExistentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('POST /api/stores', () => {
    it('should create a new store', async () => {
      const newStore = {
        name: 'New Store',
        description: 'New store description',
        sellerId: testSeller.id,
        logoUrl: 'https://example.com/newlogo.png',
        bannerUrl: 'https://example.com/newbanner.png',
        address: '456 New Store St',
        contactEmail: 'newstore@example.com',
        contactPhone: '987-654-3210'
      };
      
      const response = await request(app)
        .post('/api/stores')
        .send(newStore);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', 'New Store');
      expect(response.body.data).toHaveProperty('description', 'New store description');
      expect(response.body.data).toHaveProperty('seller');
      expect(response.body.data.seller).toHaveProperty('id', testSeller.id);
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteStore = {
        name: 'Incomplete Store'
        // Missing seller ID and other required fields
      };
      
      const response = await request(app)
        .post('/api/stores')
        .send(incompleteStore);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/stores/:id', () => {
    it('should update an existing store', async () => {
      const updateData = {
        name: 'Updated Store Name',
        description: 'Updated store description',
        logoUrl: 'https://example.com/updatedlogo.png'
      };
      
      const response = await request(app)
        .patch(`/api/stores/${storeId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', storeId);
      expect(response.body.data).toHaveProperty('name', 'Updated Store Name');
      expect(response.body.data).toHaveProperty('description', 'Updated store description');
      expect(response.body.data).toHaveProperty('logoUrl', 'https://example.com/updatedlogo.png');
    });

    it('should return 404 if store to update not found', async () => {
      const nonExistentId = 9999;
      const updateData = { name: 'Updated Name' };
      
      const response = await request(app)
        .patch(`/api/stores/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/stores/:id', () => {
    it('should delete an existing store', async () => {
      const response = await request(app)
        .delete(`/api/stores/${storeId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify store is deleted
      const findResponse = await request(app).get(`/api/stores/${storeId}`);
      expect(findResponse.status).toBe(404);
    });

    it('should return 404 if store to delete not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/stores/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});