const request = require('supertest');
const app = require('../../src/app');
const { AppDataSource } = require('../../src/config/database');
const Order = require('../../src/entities/Order');
const User = require('../../src/entities/User');
const Product = require('../../src/entities/Product');
const Seller = require('../../src/entities/Seller');
const Store = require('../../src/entities/Store');

describe('Order Routes', () => {
  let testUser;
  let testProduct;
  let testOrder;
  let orderId;
  let seller;
  let store;

  beforeAll(async () => {
    // Create test user
    const userRepo = AppDataSource.getRepository(User);
    testUser = userRepo.create({
      username: 'orderTestUser',
      email: 'orderuser@example.com',
      password: 'password123',
      firstName: 'Order',
      lastName: 'User'
    });
    await userRepo.save(testUser);

    // Create test seller and store
    const sellerRepo = AppDataSource.getRepository(Seller);
    seller = sellerRepo.create({
      username: 'orderTestSeller',
      email: 'orderseller@example.com',
      password: 'password123'
    });
    await sellerRepo.save(seller);

    const storeRepo = AppDataSource.getRepository(Store);
    store = storeRepo.create({
      name: 'Order Test Store',
      description: 'Order test store description',
      seller: seller
    });
    await storeRepo.save(store);

    // Create test product
    const productRepo = AppDataSource.getRepository(Product);
    testProduct = productRepo.create({
      name: 'Order Test Product',
      description: 'Order test product description',
      price: 79.99,
      stock: 20,
      seller: seller,
      store: store
    });
    await productRepo.save(testProduct);

    // Clear orders to ensure test isolation
    await AppDataSource.getRepository(Order).clear();
  });

  beforeEach(async () => {
    // Create a test order before each test
    const orderRepository = AppDataSource.getRepository(Order);
    testOrder = orderRepository.create({
      user: testUser,
      orderDate: new Date(),
      totalAmount: 79.99,
      status: 'pending',
      shippingAddress: '123 Test Street',
      paymentMethod: 'credit_card',
      items: [
        {
          product: testProduct,
          quantity: 1,
          price: 79.99
        }
      ]
    });
    
    const savedOrder = await orderRepository.save(testOrder);
    orderId = savedOrder.id;
  });

  afterEach(async () => {
    // Clear orders after each test
    await AppDataSource.getRepository(Order).clear();
  });

  afterAll(async () => {
    // Clean up test data
    await AppDataSource.getRepository(Product).delete({ id: testProduct.id });
    await AppDataSource.getRepository(Store).delete({ id: store.id });
    await AppDataSource.getRepository(Seller).delete({ id: seller.id });
    await AppDataSource.getRepository(User).delete({ id: testUser.id });
  });

  describe('GET /api/orders', () => {
    it('should return all orders', async () => {
      const response = await request(app).get('/api/orders');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return a single order by ID', async () => {
      const response = await request(app).get(`/api/orders/${orderId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', orderId);
      expect(response.body.data).toHaveProperty('status', 'pending');
      expect(response.body.data).toHaveProperty('totalAmount', 79.99);
    });

    it('should return 404 if order not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/orders/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/orders/user/:userId', () => {
    it('should return all orders for a specific user', async () => {
      const response = await request(app).get(`/api/orders/user/${testUser.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('user');
      expect(response.body.data[0].user).toHaveProperty('id', testUser.id);
    });

    it('should return empty array if user has no orders', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/orders/user/${nonExistentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const newOrder = {
        userId: testUser.id,
        items: [
          {
            productId: testProduct.id,
            quantity: 2
          }
        ],
        shippingAddress: '456 New Order St',
        paymentMethod: 'paypal'
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(newOrder);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('status', 'pending');
      expect(response.body.data).toHaveProperty('shippingAddress', '456 New Order St');
      expect(response.body.data).toHaveProperty('paymentMethod', 'paypal');
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteOrder = {
        userId: testUser.id
        // Missing items, shipping address, etc.
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(incompleteOrder);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/orders/:id', () => {
    it('should update an order status', async () => {
      const updateData = {
        status: 'shipped'
      };
      
      const response = await request(app)
        .patch(`/api/orders/${orderId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', orderId);
      expect(response.body.data).toHaveProperty('status', 'shipped');
    });

    it('should return 404 if order not found', async () => {
      const nonExistentId = 9999;
      const updateData = { status: 'delivered' };
      
      const response = await request(app)
        .patch(`/api/orders/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should cancel/delete an order', async () => {
      const response = await request(app)
        .delete(`/api/orders/${orderId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify order is deleted or marked as cancelled
      const findResponse = await request(app).get(`/api/orders/${orderId}`);
      
      // Depending on implementation: either 404 if truly deleted or status="cancelled" if soft deletion
      if (findResponse.status === 200) {
        expect(findResponse.body.data.status).toBe('cancelled');
      } else {
        expect(findResponse.status).toBe(404);
      }
    });

    it('should return 404 if order to cancel not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/orders/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});