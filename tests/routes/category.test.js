const request = require('supertest');
const { app, startTestServer } = require('../helpers/testAppExtended');
const { TestDataSource } = require('../../src/config/database.test');
const Category = require('../../src/entities/Category');

// Start server with a random port for testing
let server;

describe('Category Routes', () => {
  let testCategory;
  let categoryId;
  let testCategoryName = `Test Category-${Date.now()}`; // Unique name to avoid conflicts

  beforeAll(async () => {
    // Ensure we're connected to the database
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    
    // Start the test server
    server = startTestServer();
  });

  // Helper function to clean up test categories
  const removeTestCategories = async () => {
    try {
      const categoryRepository = TestDataSource.getRepository(Category);
      await categoryRepository.delete({ name: testCategoryName });
    } catch (error) {
      console.error('Error cleaning test categories:', error);
    }
  };

  beforeEach(async () => {
    // Clean up any existing test categories
    await removeTestCategories();
    
    // Create a test category before each test
    try {
      const categoryRepository = TestDataSource.getRepository(Category);
      testCategory = categoryRepository.create({
        name: testCategoryName,
        description: 'Test category description'
      });
      
      const savedCategory = await categoryRepository.save(testCategory);
      categoryId = savedCategory.id;
    } catch (error) {
      console.error('Error creating test category:', error);
    }
  });

  afterEach(async () => {
    // Clean up test categories after each test
    await removeTestCategories();
  });

  afterAll(async () => {
    // Final cleanup
    await removeTestCategories();
    
    // Close the test server
    if (server) {
      server.close();
    }
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      jest.setTimeout(10000); // 10 seconds timeout for this test
      
      const response = await request(app).get('/api/categories');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check if our test category is in the results
      const categories = response.body.data;
      const foundCategory = categories.find(c => c.name === testCategoryName);
      expect(foundCategory).toBeDefined();
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return a single category by ID', async () => {
      const response = await request(app).get(`/api/categories/${categoryId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', categoryId);
      expect(response.body.data).toHaveProperty('name', testCategoryName);
      expect(response.body.data).toHaveProperty('description', 'Test category description');
    });

    it('should return 404 if category not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/categories/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const newCategoryName = `New Category-${Date.now()}`;
      const newCategory = {
        name: newCategoryName,
        description: 'New category description'
      };
      
      const response = await request(app)
        .post('/api/categories')
        .send(newCategory);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', newCategoryName);
      expect(response.body.data).toHaveProperty('description', 'New category description');
      
      // Clean up the created category right away to avoid conflicts
      const categoryRepository = TestDataSource.getRepository(Category);
      await categoryRepository.delete({ name: newCategoryName });
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteCategory = {
        // Missing name field
        description: 'Incomplete category description'
      };
      
      const response = await request(app)
        .post('/api/categories')
        .send(incompleteCategory);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/categories/:id', () => {
    it('should update an existing category', async () => {
      const updateData = {
        name: `Updated Category-${Date.now()}`,
        description: 'Updated category description'
      };
      
      const response = await request(app)
        .patch(`/api/categories/${categoryId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', categoryId);
      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty('description', 'Updated category description');
      
      // Update test category name for cleanup
      testCategoryName = updateData.name;
    });

    it('should return 404 if category to update not found', async () => {
      const nonExistentId = 9999;
      const updateData = { name: 'Updated Name' };
      
      const response = await request(app)
        .patch(`/api/categories/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete an existing category', async () => {
      const response = await request(app)
        .delete(`/api/categories/${categoryId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify category is deleted
      const findResponse = await request(app).get(`/api/categories/${categoryId}`);
      expect(findResponse.status).toBe(404);
    });

    it('should return 404 if category to delete not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/categories/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});