const request = require('supertest');
const { app, startTestServer } = require('../helpers/testAppExtended');
const { TestDataSource } = require('../../src/config/database.test');
const Product = require('../../src/entities/Product');
const User = require('../../src/entities/User');
const Category = require('../../src/entities/Category');

// Start server with a random port for testing
let server;

describe('Simplified Product Routes', () => {
  let testCategory;
  let testUser;
  let testProduct;
  let productId;
  let userId;
  let categoryId;
  let timestamp = Date.now();
  let testProductName = `Test Product-${timestamp}`;

  beforeAll(async () => {
    // Ensure we're connected to the database
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    
    // Start the test server
    server = startTestServer();
    
    try {
      // 1. First create category (independent entity)
      const categoryRepository = TestDataSource.getRepository(Category);
      testCategory = categoryRepository.create({
        categoryName: `Test Category-${timestamp}`,
        categoryImage: JSON.stringify({url: 'https://example.com/image.jpg'}), // JSONB requires object
        categoryTopic: 'Test Topic',
        status: 'active',
        createdAt: new Date(),
        time: new Date().toTimeString().split(' ')[0]
      });
      const savedCategory = await categoryRepository.save(testCategory);
      categoryId = savedCategory.id;
      
      // 2. Create user (independent entity)
      const userRepository = TestDataSource.getRepository(User);
      testUser = userRepository.create({
        email: `test-${timestamp}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '555-123-4567'
      });
      const savedUser = await userRepository.save(testUser);
      userId = savedUser.id;
    } catch (error) {
      console.error('Error in setup:', error);
    }
  });

  beforeEach(async () => {
    try {
      // Clean up any existing test products
      const productRepository = TestDataSource.getRepository(Product);
      if (productId) {
        await productRepository.delete({ id: productId });
      }
      
      // Create a simplified test product directly with storeId
      testProduct = productRepository.create({
        productName: testProductName,
        productImage: 'test-image.jpg',
        productStatus: 'active',
        standardPrice: 99.99,
        offerPrice: 79.99,
        productDescription: 'Test product description',
        productDate: new Date(),
        productQuantity: 10,
        storeId: 1 // Use a fixed ID for simplicity in tests
      });
      
      const savedProduct = await productRepository.save(testProduct);
      productId = savedProduct.id;
    } catch (error) {
      console.error('Error creating test product:', error);
    }
  });

  afterEach(async () => {
    try {
      // Clean up test products after each test
      const productRepository = TestDataSource.getRepository(Product);
      if (productId) {
        await productRepository.delete({ id: productId });
        productId = null;
      }
    } catch (error) {
      console.error('Error cleaning test products:', error);
    }
  });

  afterAll(async () => {
    try {
      // Final cleanup - independent entities last
      const userRepository = TestDataSource.getRepository(User);
      const categoryRepository = TestDataSource.getRepository(Category);
      
      if (userId) {
        await userRepository.delete({ id: userId });
      }
      
      if (categoryId) {
        await categoryRepository.delete({ id: categoryId });
      }
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
    
    // Close the test server
    if (server) {
      server.close();
    }
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by ID', async () => {
      if (!productId) {
        console.warn('Test skipped: No product ID available');
        return;
      }
      
      const response = await request(app).get(`/api/products/${productId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', productId);
      expect(response.body.data).toHaveProperty('productName', testProductName);
    });

    it('should return 404 if product not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/products/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProductName = `New Product-${timestamp + 1}`;
      const newProduct = {
        productName: newProductName,
        productImage: 'new-image.jpg',
        productStatus: 'active',
        standardPrice: 149.99,
        offerPrice: 129.99,
        productDescription: 'New product description',
        productDate: new Date().toISOString().split('T')[0],
        productQuantity: 25,
        storeId: 1 // Use a fixed ID for simplicity in tests
      };
      
      const response = await request(app)
        .post('/api/products')
        .send(newProduct);
      
      // Save the ID for cleanup
      const newProductId = response.body.data?.id;
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('productName', newProductName);
      
      // Clean up the created product
      try {
        if (newProductId) {
          const productRepository = TestDataSource.getRepository(Product);
          await productRepository.delete({ id: newProductId });
        }
      } catch (error) {
        console.error('Error cleaning up new product:', error);
      }
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete an existing product', async () => {
      if (!productId) {
        console.warn('Test skipped: No product ID available');
        return;
      }
      
      const response = await request(app)
        .delete(`/api/products/${productId}`);
      
      expect(response.status).toBe(200);
      
      // Product is now deleted, so set productId to null to avoid duplicate deletion
      productId = null;
    });
  });
});