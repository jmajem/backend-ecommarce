const request = require('supertest');
const app = require('../../src/app');
const { AppDataSource } = require('../../src/config/database');
const CommentReply = require('../../src/entities/CommentReply');
const Comment = require('../../src/entities/Comment');
const User = require('../../src/entities/User');
const Product = require('../../src/entities/Product');
const Seller = require('../../src/entities/Seller');
const Store = require('../../src/entities/Store');

describe('Comment Reply Routes', () => {
  let testUser;
  let testProduct;
  let testComment;
  let testReply;
  let replyId;
  let seller;
  let store;

  beforeAll(async () => {
    // Create test user
    const userRepo = AppDataSource.getRepository(User);
    testUser = userRepo.create({
      username: 'replyTestUser',
      email: 'replyuser@example.com',
      password: 'password123',
      firstName: 'Reply',
      lastName: 'User'
    });
    await userRepo.save(testUser);

    // Create test seller and store
    const sellerRepo = AppDataSource.getRepository(Seller);
    seller = sellerRepo.create({
      username: 'replyTestSeller',
      email: 'replyseller@example.com',
      password: 'password123'
    });
    await sellerRepo.save(seller);

    const storeRepo = AppDataSource.getRepository(Store);
    store = storeRepo.create({
      name: 'Reply Test Store',
      description: 'Reply test store description',
      seller: seller
    });
    await storeRepo.save(store);

    // Create test product
    const productRepo = AppDataSource.getRepository(Product);
    testProduct = productRepo.create({
      name: 'Reply Test Product',
      description: 'Reply test product description',
      price: 59.99,
      stock: 25,
      seller: seller,
      store: store
    });
    await productRepo.save(testProduct);

    // Create test comment
    const commentRepo = AppDataSource.getRepository(Comment);
    testComment = commentRepo.create({
      content: 'This is a test comment for replies',
      user: testUser,
      product: testProduct
    });
    await commentRepo.save(testComment);

    // Clear replies to ensure test isolation
    await AppDataSource.getRepository(CommentReply).clear();
  });

  beforeEach(async () => {
    // Create a test reply before each test
    const replyRepository = AppDataSource.getRepository(CommentReply);
    testReply = replyRepository.create({
      content: 'This is a test reply',
      user: testUser,
      comment: testComment
    });
    
    const savedReply = await replyRepository.save(testReply);
    replyId = savedReply.id;
  });

  afterEach(async () => {
    // Clear replies after each test
    await AppDataSource.getRepository(CommentReply).clear();
  });

  afterAll(async () => {
    // Clean up test data
    await AppDataSource.getRepository(Comment).delete({ id: testComment.id });
    await AppDataSource.getRepository(Product).delete({ id: testProduct.id });
    await AppDataSource.getRepository(Store).delete({ id: store.id });
    await AppDataSource.getRepository(Seller).delete({ id: seller.id });
    await AppDataSource.getRepository(User).delete({ id: testUser.id });
  });

  describe('GET /api/comment-replies', () => {
    it('should return all comment replies', async () => {
      const response = await request(app).get('/api/comment-replies');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/comment-replies/:id', () => {
    it('should return a single comment reply by ID', async () => {
      const response = await request(app).get(`/api/comment-replies/${replyId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', replyId);
      expect(response.body.data).toHaveProperty('content', 'This is a test reply');
    });

    it('should return 404 if comment reply not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/comment-replies/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/comment-replies/comment/:commentId', () => {
    it('should return all replies for a specific comment', async () => {
      const response = await request(app).get(`/api/comment-replies/comment/${testComment.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('comment');
      expect(response.body.data[0].comment).toHaveProperty('id', testComment.id);
    });

    it('should return empty array if comment has no replies', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/comment-replies/comment/${nonExistentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/comment-replies/user/:userId', () => {
    it('should return all replies by a specific user', async () => {
      const response = await request(app).get(`/api/comment-replies/user/${testUser.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('user');
      expect(response.body.data[0].user).toHaveProperty('id', testUser.id);
    });

    it('should return empty array if user has no replies', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/comment-replies/user/${nonExistentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('POST /api/comment-replies', () => {
    it('should create a new comment reply', async () => {
      const newReply = {
        content: 'This is a new reply',
        userId: testUser.id,
        commentId: testComment.id
      };
      
      const response = await request(app)
        .post('/api/comment-replies')
        .send(newReply);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('content', 'This is a new reply');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', testUser.id);
      expect(response.body.data).toHaveProperty('comment');
      expect(response.body.data.comment).toHaveProperty('id', testComment.id);
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteReply = {
        content: 'Incomplete reply'
        // Missing user and comment IDs
      };
      
      const response = await request(app)
        .post('/api/comment-replies')
        .send(incompleteReply);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/comment-replies/:id', () => {
    it('should update an existing comment reply', async () => {
      const updateData = {
        content: 'This reply has been updated'
      };
      
      const response = await request(app)
        .patch(`/api/comment-replies/${replyId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', replyId);
      expect(response.body.data).toHaveProperty('content', 'This reply has been updated');
    });

    it('should return 404 if comment reply not found', async () => {
      const nonExistentId = 9999;
      const updateData = { content: 'Updated content' };
      
      const response = await request(app)
        .patch(`/api/comment-replies/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/comment-replies/:id', () => {
    it('should delete an existing comment reply', async () => {
      const response = await request(app)
        .delete(`/api/comment-replies/${replyId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify reply is deleted
      const findResponse = await request(app).get(`/api/comment-replies/${replyId}`);
      expect(findResponse.status).toBe(404);
    });

    it('should return 404 if comment reply not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/comment-replies/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});