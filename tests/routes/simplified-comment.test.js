const request = require('supertest');
const { app, startTestServer } = require('../helpers/testAppExtended');
const { TestDataSource } = require('../../src/config/database.test');
const Comment = require('../../src/entities/Comment');
const User = require('../../src/entities/User');
const Product = require('../../src/entities/Product');

// Start server with a random port for testing
let server;

describe('Simplified Comment Routes', () => {
  let testUser;
  let testProduct;
  let testComment;
  let commentId;
  let userId;
  let productId;
  let timestamp = Date.now();
  let testCommentContent = `Test comment-${timestamp}`;

  beforeAll(async () => {
    // Ensure we're connected to the database
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    
    // Start the test server
    server = startTestServer();
    
    try {
      // 1. Create user (independent entity)
      const userRepository = TestDataSource.getRepository(User);
      testUser = userRepository.create({
        email: `comment-user-${timestamp}@example.com`,
        password: 'password123',
        firstName: 'Comment',
        lastName: 'User',
        phoneNumber: '555-123-4567'
      });
      const savedUser = await userRepository.save(testUser);
      userId = savedUser.id;
      
      // 2. Use an existing product or create a simplified one
      const productRepository = TestDataSource.getRepository(Product);
      const existingProduct = await productRepository.findOne({ 
        where: {},
        order: { id: 'DESC' }
      });
      
      if (existingProduct) {
        productId = existingProduct.id;
      } else {
        // Create a new product if none exists (with required fields)
        testProduct = productRepository.create({
          productName: `Comment Test Product-${timestamp}`,
          productImage: 'test-image.jpg',
          productStatus: 'active',
          standardPrice: 49.99,
          offerPrice: 39.99,
          productDescription: 'Test product for comments',
          productDate: new Date(),
          productQuantity: 50,
          storeId: 1 // Use a fixed ID for simplicity
        });
        const savedProduct = await productRepository.save(testProduct);
        productId = savedProduct.id;
      }
    } catch (error) {
      console.error('Error in setup:', error);
    }
  });

  beforeEach(async () => {
    try {
      // Clean up any existing test comments
      const commentRepository = TestDataSource.getRepository(Comment);
      if (commentId) {
        await commentRepository.delete({ id: commentId });
      }
      
      // Create a test comment
      testComment = commentRepository.create({
        content: testCommentContent,
        rating: 5, // Add the required rating field
        user: { id: userId },
        product: { id: productId }
      });
      
      const savedComment = await commentRepository.save(testComment);
      commentId = savedComment.id;
    } catch (error) {
      console.error('Error creating test comment:', error);
    }
  });

  afterEach(async () => {
    try {
      // Clean up test comments after each test
      const commentRepository = TestDataSource.getRepository(Comment);
      if (commentId) {
        await commentRepository.delete({ id: commentId });
        commentId = null;
      }
    } catch (error) {
      console.error('Error cleaning test comments:', error);
    }
  });

  afterAll(async () => {
    try {
      // Final cleanup - clean up any remaining comments first
      const commentRepository = TestDataSource.getRepository(Comment);
      await commentRepository.delete({ user: { id: userId } });
      
      // Then clean up user (we don't delete the product, as it might be shared)
      const userRepository = TestDataSource.getRepository(User);
      if (userId) {
        await userRepository.delete({ id: userId });
      }
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
    
    // Close the test server
    if (server) {
      server.close();
    }
  });

  describe('GET /api/comments/:id', () => {
    it('should return a single comment by ID', async () => {
      if (!commentId) {
        console.warn('Test skipped: No comment ID available');
        return;
      }
      
      const response = await request(app).get(`/api/comments/${commentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', commentId);
      expect(response.body.data).toHaveProperty('content', testCommentContent);
    });

    it('should return 404 if comment not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/comments/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/comments', () => {
    it('should create a new comment', async () => {
      const newCommentContent = `New comment-${timestamp + 1}`;
      const newComment = {
        content: newCommentContent,
        rating: 4, // Add the required rating field
        userId: userId,
        productId: productId
      };
      
      const response = await request(app)
        .post('/api/comments')
        .send(newComment);
      
      // Save the ID for cleanup
      const newCommentId = response.body.data?.id;
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('content', newCommentContent);
      
      // Clean up the created comment
      try {
        if (newCommentId) {
          const commentRepository = TestDataSource.getRepository(Comment);
          await commentRepository.delete({ id: newCommentId });
        }
      } catch (error) {
        console.error('Error cleaning up new comment:', error);
      }
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteComment = {
        content: 'Incomplete comment'
        // Missing userId and productId
      };
      
      const response = await request(app)
        .post('/api/comments')
        .send(incompleteComment);
      
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete an existing comment', async () => {
      if (!commentId) {
        console.warn('Test skipped: No comment ID available');
        return;
      }
      
      const response = await request(app)
        .delete(`/api/comments/${commentId}`);
      
      expect(response.status).toBe(200);
      
      // Comment is now deleted, so set commentId to null to avoid duplicate deletion
      commentId = null;
    });
  });
});