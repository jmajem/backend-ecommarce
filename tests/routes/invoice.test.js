const request = require('supertest');
const app = require('../../src/app');
const { AppDataSource } = require('../../src/config/database');
const Invoice = require('../../src/entities/Invoice');
const Order = require('../../src/entities/Order');
const User = require('../../src/entities/User');
const Product = require('../../src/entities/Product');
const Seller = require('../../src/entities/Seller');
const Store = require('../../src/entities/Store');

describe('Invoice Routes', () => {
  let testUser;
  let testProduct;
  let testSeller;
  let testStore;
  let testOrder;
  let testInvoice;
  let invoiceId;

  beforeAll(async () => {
    // Create test user
    const userRepo = AppDataSource.getRepository(User);
    testUser = userRepo.create({
      username: 'invoiceTestUser',
      email: 'invoiceuser@example.com',
      password: 'password123',
      firstName: 'Invoice',
      lastName: 'User'
    });
    await userRepo.save(testUser);

    // Create test seller and store
    const sellerRepo = AppDataSource.getRepository(Seller);
    testSeller = sellerRepo.create({
      username: 'invoiceTestSeller',
      email: 'invoiceseller@example.com',
      password: 'password123'
    });
    await sellerRepo.save(testSeller);

    const storeRepo = AppDataSource.getRepository(Store);
    testStore = storeRepo.create({
      name: 'Invoice Test Store',
      description: 'Invoice test store description',
      seller: testSeller
    });
    await storeRepo.save(testStore);

    // Create test product
    const productRepo = AppDataSource.getRepository(Product);
    testProduct = productRepo.create({
      name: 'Invoice Test Product',
      description: 'Invoice test product description',
      price: 129.99,
      stock: 30,
      seller: testSeller,
      store: testStore
    });
    await productRepo.save(testProduct);

    // Create test order
    const orderRepo = AppDataSource.getRepository(Order);
    testOrder = orderRepo.create({
      user: testUser,
      orderDate: new Date(),
      totalAmount: 129.99,
      status: 'completed',
      shippingAddress: '123 Invoice Test St',
      paymentMethod: 'credit_card',
      items: [
        {
          product: testProduct,
          quantity: 1,
          price: 129.99
        }
      ]
    });
    await orderRepo.save(testOrder);

    // Clear invoices to ensure test isolation
    await AppDataSource.getRepository(Invoice).clear();
  });

  beforeEach(async () => {
    // Create a test invoice before each test
    const invoiceRepository = AppDataSource.getRepository(Invoice);
    testInvoice = invoiceRepository.create({
      invoiceNumber: `INV-${Date.now()}`,
      order: testOrder,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      totalAmount: 129.99,
      status: 'paid',
      paymentMethod: 'credit_card',
      billingAddress: '123 Invoice Test St'
    });
    
    const savedInvoice = await invoiceRepository.save(testInvoice);
    invoiceId = savedInvoice.id;
  });

  afterEach(async () => {
    // Clear invoices after each test
    await AppDataSource.getRepository(Invoice).clear();
  });

  afterAll(async () => {
    // Clean up test data
    await AppDataSource.getRepository(Order).delete({ id: testOrder.id });
    await AppDataSource.getRepository(Product).delete({ id: testProduct.id });
    await AppDataSource.getRepository(Store).delete({ id: testStore.id });
    await AppDataSource.getRepository(Seller).delete({ id: testSeller.id });
    await AppDataSource.getRepository(User).delete({ id: testUser.id });
  });

  describe('GET /api/invoices', () => {
    it('should return all invoices', async () => {
      const response = await request(app).get('/api/invoices');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should return a single invoice by ID', async () => {
      const response = await request(app).get(`/api/invoices/${invoiceId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', invoiceId);
      expect(response.body.data).toHaveProperty('invoiceNumber');
      expect(response.body.data).toHaveProperty('totalAmount', 129.99);
      expect(response.body.data).toHaveProperty('status', 'paid');
    });

    it('should return 404 if invoice not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/invoices/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/invoices/order/:orderId', () => {
    it('should return invoice for a specific order', async () => {
      const response = await request(app).get(`/api/invoices/order/${testOrder.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', invoiceId);
      expect(response.body.data).toHaveProperty('order');
      expect(response.body.data.order).toHaveProperty('id', testOrder.id);
    });

    it('should return 404 if invoice for order not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/invoices/order/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/invoices/user/:userId', () => {
    it('should return all invoices for a specific user', async () => {
      const response = await request(app).get(`/api/invoices/user/${testUser.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('order');
      expect(response.body.data[0].order).toHaveProperty('user');
      expect(response.body.data[0].order.user).toHaveProperty('id', testUser.id);
    });

    it('should return empty array if user has no invoices', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/invoices/user/${nonExistentId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('POST /api/invoices', () => {
    it('should create a new invoice', async () => {
      // First, delete the existing test invoice
      await AppDataSource.getRepository(Invoice).delete({ id: invoiceId });
      
      const newInvoice = {
        orderId: testOrder.id,
        invoiceNumber: `INV-NEW-${Date.now()}`,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: 129.99,
        status: 'pending',
        paymentMethod: 'paypal',
        billingAddress: '456 New Invoice St'
      };
      
      const response = await request(app)
        .post('/api/invoices')
        .send(newInvoice);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('invoiceNumber', newInvoice.invoiceNumber);
      expect(response.body.data).toHaveProperty('totalAmount', 129.99);
      expect(response.body.data).toHaveProperty('status', 'pending');
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteInvoice = {
        invoiceNumber: 'Incomplete-Invoice'
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/invoices')
        .send(incompleteInvoice);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/invoices/:id', () => {
    it('should update an invoice status', async () => {
      const updateData = {
        status: 'overdue'
      };
      
      const response = await request(app)
        .patch(`/api/invoices/${invoiceId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', invoiceId);
      expect(response.body.data).toHaveProperty('status', 'overdue');
    });

    it('should return 404 if invoice not found', async () => {
      const nonExistentId = 9999;
      const updateData = { status: 'paid' };
      
      const response = await request(app)
        .patch(`/api/invoices/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/invoices/:id', () => {
    it('should delete an invoice', async () => {
      const response = await request(app)
        .delete(`/api/invoices/${invoiceId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify invoice is deleted
      const findResponse = await request(app).get(`/api/invoices/${invoiceId}`);
      expect(findResponse.status).toBe(404);
    });

    it('should return 404 if invoice to delete not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/invoices/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});