const request = require('supertest');
const { app, startTestServer } = require('../helpers/testAppExtended');
const { TestDataSource } = require('../../src/config/database.test');
const Comment = require('../../src/entities/Comment');
const User = require('../../src/entities/User');
const Product = require('../../src/entities/Product');
const Seller = require('../../src/entities/Seller');
const Store = require('../../src/entities/Store');

// Start server with a random port for testing
let server;

describe('Comment Routes', () => {
  let testUser;
  let testProduct;
  let testComment;
  let commentId;
  let testCommentContent = `Test comment-${Date.now()}`; // Unique comment to avoid conflicts
  let testSeller;
  let testStore;
  let userId;
  let productId;

  beforeAll(async () => {
    // Ensure we're connected to the database
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    
    // Start the test server
    server = startTestServer();
    
    // Create test user
    const userRepository = TestDataSource.getRepository(User);
    testUser = userRepository.create({
      email: `comment-user-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Comment',
      lastName: 'User',
      phoneNumber: '555-123-4567'
    });
    const savedUser = await userRepository.save(testUser);
    userId = savedUser.id;
    
    // Create test seller
    const sellerRepository = TestDataSource.getRepository(Seller);
    testSeller = sellerRepository.create({
      username: `comment-seller-${Date.now()}`,
      email: `comment-seller-${Date.now()}@example.com`,
      password: 'password123',
      user: testUser
    });
    await sellerRepository.save(testSeller);
    
    // Create test store
    const storeRepository = TestDataSource.getRepository(Store);
    testStore = storeRepository.create({
      name: `Comment Test Store-${Date.now()}`,
      description: 'Test store for comments',
      seller: testSeller
    });
    await storeRepository.save(testStore);
    
    // Create test product
    const productRepository = TestDataSource.getRepository(Product);
    testProduct = productRepository.create({
      name: `Comment Test Product-${Date.now()}`,
      description: 'Test product for comments',
      price: 49.99,
      stock: 50,
      seller: testSeller,
      store: testStore
    });
    const savedProduct = await productRepository.save(testProduct);
    productId = savedProduct.id;
  });

  // Helper function to clean up test comments
  const removeTestComments = async () => {
    try {
      const commentRepository = TestDataSource.getRepository(Comment);
      await commentRepository.delete({ content: testCommentContent });
    } catch (error) {
      console.error('Error cleaning test comments:', error);
    }
  };

  beforeEach(async () => {
    // Clean up any existing test comments
    await removeTestComments();
    
    // Create a test comment before each test
    try {
      const commentRepository = TestDataSource.getRepository(Comment);
      testComment = commentRepository.create({
        content: testCommentContent,
        user: testUser,
        product: testProduct
      });
      
      const savedComment = await commentRepository.save(testComment);
      commentId = savedComment.id;
    } catch (error) {
      console.error('Error creating test comment:', error);
    }
  });

  afterEach(async () => {
    // Clean up test comments after each test
    await removeTestComments();
  });

  afterAll(async () => {
    // Final cleanup
    await removeTestComments();
    
    // Remove test product, store, seller, and user
    try {
      const productRepository = TestDataSource.getRepository(Product);
      const storeRepository = TestDataSource.getRepository(Store);
      const sellerRepository = TestDataSource.getRepository(Seller);
      const userRepository = TestDataSource.getRepository(User);
      
      await productRepository.delete({ id: productId });
      await storeRepository.delete({ id: testStore.id });
      await sellerRepository.delete({ id: testSeller.id });
      await userRepository.delete({ id: userId });
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
    
    // Close the test server
    if (server) {
      server.close();
    }
  });

  describe('GET /api/comments', () => {
    it('should return all comments', async () => {
      jest.setTimeout(10000); // 10 seconds timeout for this test
      
      const response = await request(app).get('/api/comments');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check if our test comment is in the results
      const comments = response.body.data;
      const foundComment = comments.find(c => c.content === testCommentContent);
      expect(foundComment).toBeDefined();
    });
  });

  describe('GET /api/comments/:id', () => {
    it('should return a single comment by ID', async () => {
      const response = await request(app).get(`/api/comments/${commentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', commentId);
      expect(response.body.data).toHaveProperty('content', testCommentContent);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('product');
    });

    it('should return 404 if comment not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/comments/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/comments/product/:productId', () => {
    it('should return all comments for a specific product', async () => {
      const response = await request(app).get(`/api/comments/product/${productId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check if our test comment is in the results
      const comments = response.body.data;
      const foundComment = comments.find(c => c.content === testCommentContent);
      expect(foundComment).toBeDefined();
    });
  });

  describe('GET /api/comments/user/:userId', () => {
    it('should return all comments by a specific user', async () => {
      const response = await request(app).get(`/api/comments/user/${userId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check if our test comment is in the results
      const comments = response.body.data;
      const foundComment = comments.find(c => c.content === testCommentContent);
      expect(foundComment).toBeDefined();
    });
  });

  describe('POST /api/comments', () => {
    it('should create a new comment', async () => {
      const newCommentContent = `New comment-${Date.now()}`;
      const newComment = {
        content: newCommentContent,
        userId: userId,
        productId: productId
      };
      
      const response = await request(app)
        .post('/api/comments')
        .send(newComment);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('content', newCommentContent);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', userId);
      expect(response.body.data).toHaveProperty('product');
      expect(response.body.data.product).toHaveProperty('id', productId);
      
      // Clean up the created comment right away to avoid conflicts
      const commentRepository = TestDataSource.getRepository(Comment);
      await commentRepository.delete({ content: newCommentContent });
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteComment = {
        // Missing required fields
        content: 'Incomplete comment'
      };
      
      const response = await request(app)
        .post('/api/comments')
        .send(incompleteComment);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/comments/:id', () => {
    it('should update an existing comment', async () => {
      const updatedContent = `Updated comment-${Date.now()}`;
      const updateData = {
        content: updatedContent
      };
      
      const response = await request(app)
        .patch(`/api/comments/${commentId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', commentId);
      expect(response.body.data).toHaveProperty('content', updatedContent);
      
      // Update test comment content for cleanup
      testCommentContent = updatedContent;
    });

    it('should return 404 if comment to update not found', async () => {
      const nonExistentId = 9999;
      const updateData = { content: 'Updated content' };
      
      const response = await request(app)
        .patch(`/api/comments/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete an existing comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${commentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify comment is deleted
      const findResponse = await request(app).get(`/api/comments/${commentId}`);
      expect(findResponse.status).toBe(404);
    });

    it('should return 404 if comment to delete not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/comments/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});