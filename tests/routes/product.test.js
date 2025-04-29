const request = require('supertest');
const { app, startTestServer } = require('../helpers/testAppExtended');
const { TestDataSource } = require('../../src/config/database.test');
const Product = require('../../src/entities/Product');
const Seller = require('../../src/entities/Seller');
const Store = require('../../src/entities/Store');
const User = require('../../src/entities/User');
const Category = require('../../src/entities/Category');

// Start server with a random port for testing
let server;

describe('Product Routes', () => {
  let testSeller;
  let testStore;
  let testProduct;
  let testCategory;
  let productId;
  let testProductName = `Test Product-${Date.now()}`; // Unique name to avoid conflicts

  beforeAll(async () => {
    // Ensure we're connected to the database
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    
    // Start the test server
    server = startTestServer();
    
    // 1. First, create independent entities: categories
    const categoryRepository = TestDataSource.getRepository(Category);
    testCategory = categoryRepository.create({
      name: `Test Category-${Date.now()}`,
      description: 'Test category description'
    });
    await categoryRepository.save(testCategory);
    
    // 2. Create user (independent entity)
    const userRepository = TestDataSource.getRepository(User);
    const testUser = userRepository.create({
      email: `seller-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Seller',
      lastName: 'Test',
      phoneNumber: '555-123-4567'
    });
    await userRepository.save(testUser);
    
    // 3. Create seller (depends on user)
    const sellerRepository = TestDataSource.getRepository(Seller);
    testSeller = sellerRepository.create({
      username: `seller-${Date.now()}`,
      email: `seller-${Date.now()}@example.com`,
      password: 'password123',
      user: testUser
    });
    await sellerRepository.save(testSeller);
    
    // 4. Create store (depends on seller)
    const storeRepository = TestDataSource.getRepository(Store);
    testStore = storeRepository.create({
      name: `Test Store-${Date.now()}`,
      description: 'Test store description',
      address: '123 Test Store Address',
      phoneNumber: '555-555-5555',
      email: `store-${Date.now()}@example.com`,
      seller: testSeller
    });
    await storeRepository.save(testStore);
    
    // Update the seller with the store reference
    testSeller.storeId = testStore.id;
    await sellerRepository.save(testSeller);
  });

  // Helper function to clean up test products
  const removeTestProducts = async () => {
    try {
      const productRepository = TestDataSource.getRepository(Product);
      // Use the product ID for deletion instead of name
      if (productId) {
        await productRepository.delete({ id: productId });
      }
    } catch (error) {
      console.error('Error cleaning test products:', error);
    }
  };

  beforeEach(async () => {
    // Clean up any existing test products
    await removeTestProducts();
    
    // Create a test product before each test
    try {
      const productRepository = TestDataSource.getRepository(Product);
      testProduct = productRepository.create({
        productName: testProductName,
        productImage: 'test-image.jpg',
        productStatus: 'active',
        standardPrice: 99.99,
        offerPrice: 79.99,
        productDescription: 'Test product description',
        productDate: new Date(),
        productQuantity: 10,
        storeId: testStore.id
      });
      
      const savedProduct = await productRepository.save(testProduct);
      productId = savedProduct.id;
    } catch (error) {
      console.error('Error creating test product:', error);
    }
  });

  afterEach(async () => {
    // Clean up test products after each test
    await removeTestProducts();
  });

  afterAll(async () => {
    // Final cleanup - clean up in reverse order of creation
    
    // 1. First, remove all products (most dependent)
    await removeTestProducts();
    
    try {
      // 2. Delete store relationship from seller
      if (testSeller && testSeller.id) {
        const sellerRepository = TestDataSource.getRepository(Seller);
        testSeller.storeId = null;
        await sellerRepository.save(testSeller);
      }
      
      // 3. Delete store (depends on seller)
      if (testStore && testStore.id) {
        const storeRepository = TestDataSource.getRepository(Store);
        await storeRepository.delete({ id: testStore.id });
      }
      
      // 4. Delete seller (depends on user)
      if (testSeller && testSeller.id) {
        const sellerRepository = TestDataSource.getRepository(Seller);
        await sellerRepository.delete({ id: testSeller.id });
      }
      
      // 5. Finally, delete independent entities (categories)
      if (testCategory && testCategory.id) {
        const categoryRepository = TestDataSource.getRepository(Category);
        await categoryRepository.delete({ id: testCategory.id });
      }
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
    
    // Close the test server
    if (server) {
      server.close();
    }
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      jest.setTimeout(10000); // 10 seconds timeout for this test
      
      const response = await request(app).get('/api/products');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check if our test product is in the results
      const products = response.body.data;
      const foundProduct = products.find(p => p.name === testProductName);
      expect(foundProduct).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by ID', async () => {
      const response = await request(app).get(`/api/products/${productId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', productId);
      expect(response.body.data).toHaveProperty('productName', testProductName);
      expect(response.body.data).toHaveProperty('standardPrice', 99.99);
      expect(response.body.data).toHaveProperty('productQuantity', 10);
    });

    it('should return 404 if product not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/products/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProductName = `New Product-${Date.now()}`;
      const newProduct = {
        productName: newProductName,
        productImage: 'new-image.jpg',
        productStatus: 'active',
        standardPrice: 149.99,
        offerPrice: 129.99,
        productDescription: 'New product description',
        productDate: new Date().toISOString().split('T')[0],
        productQuantity: 25,
        storeId: testStore.id
      };
      
      const response = await request(app)
        .post('/api/products')
        .send(newProduct);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('productName', newProductName);
      expect(response.body.data).toHaveProperty('standardPrice', 149.99);
      expect(response.body.data).toHaveProperty('productQuantity', 25);
      
      // Clean up the created product right away to avoid conflicts
      const productRepository = TestDataSource.getRepository(Product);
      await productRepository.delete({ productName: newProductName });
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteProduct = {
        productName: 'Incomplete Product'
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/products')
        .send(incompleteProduct);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/products/:id', () => {
    it('should update an existing product', async () => {
      const updateData = {
        productName: `Updated Product-${Date.now()}`,
        standardPrice: 129.99,
        productQuantity: 15
      };
      
      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', productId);
      expect(response.body.data).toHaveProperty('productName', updateData.productName);
      expect(response.body.data).toHaveProperty('standardPrice', 129.99);
      expect(response.body.data).toHaveProperty('productQuantity', 15);
      
      // Update test product name for cleanup
      testProductName = updateData.productName;
    });

    it('should return 404 if product to update not found', async () => {
      const nonExistentId = 9999;
      const updateData = { productName: 'Updated Name' };
      
      const response = await request(app)
        .patch(`/api/products/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete an existing product', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify product is deleted
      const findResponse = await request(app).get(`/api/products/${productId}`);
      expect(findResponse.status).toBe(404);
    });

    it('should return 404 if product to delete not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/products/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});