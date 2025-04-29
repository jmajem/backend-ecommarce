const request = require('supertest');
const { app, startTestServer } = require('../helpers/testAppExtended');
const { TestDataSource } = require('../../src/config/database.test');
const Cart = require('../../src/entities/Cart');
const CartItem = require('../../src/entities/CartItem');
const User = require('../../src/entities/User');
const Product = require('../../src/entities/Product');
const Seller = require('../../src/entities/Seller');
const Store = require('../../src/entities/Store');

// Start server with a random port for testing
let server;

describe('Cart Routes', () => {
  let testUser;
  let testProduct;
  let testCart;
  let testCartItem;
  let cartId;
  let cartItemId;
  let userId;
  let productId;
  let testSeller;
  let testStore;

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
      email: `cart-user-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Cart',
      lastName: 'User',
      phoneNumber: '555-123-4567'
    });
    const savedUser = await userRepository.save(testUser);
    userId = savedUser.id;
    
    // Create test seller
    const sellerRepository = TestDataSource.getRepository(Seller);
    testSeller = sellerRepository.create({
      username: `cart-seller-${Date.now()}`,
      email: `cart-seller-${Date.now()}@example.com`,
      password: 'password123',
      user: testUser
    });
    await sellerRepository.save(testSeller);
    
    // Create test store
    const storeRepository = TestDataSource.getRepository(Store);
    testStore = storeRepository.create({
      name: `Cart Test Store-${Date.now()}`,
      description: 'Test store for carts',
      seller: testSeller
    });
    await storeRepository.save(testStore);
    
    // Create test product
    const productRepository = TestDataSource.getRepository(Product);
    testProduct = productRepository.create({
      name: `Cart Test Product-${Date.now()}`,
      description: 'Test product for carts',
      price: 29.99,
      stock: 100,
      seller: testSeller,
      store: testStore
    });
    const savedProduct = await productRepository.save(testProduct);
    productId = savedProduct.id;
  });

  // Helper function to clean up test carts and cart items
  const removeTestCartItems = async () => {
    try {
      const cartItemRepository = TestDataSource.getRepository(CartItem);
      await cartItemRepository.delete({ cart: { user: { id: userId } } });
    } catch (error) {
      console.error('Error cleaning test cart items:', error);
    }
  };
  
  const removeTestCarts = async () => {
    try {
      const cartRepository = TestDataSource.getRepository(Cart);
      await cartRepository.delete({ user: { id: userId } });
    } catch (error) {
      console.error('Error cleaning test carts:', error);
    }
  };

  beforeEach(async () => {
    // Clean up any existing test carts and cart items
    await removeTestCartItems();
    await removeTestCarts();
    
    // Create a test cart before each test
    try {
      const cartRepository = TestDataSource.getRepository(Cart);
      testCart = cartRepository.create({
        user: testUser
      });
      
      const savedCart = await cartRepository.save(testCart);
      cartId = savedCart.id;
      
      // Create a test cart item
      const cartItemRepository = TestDataSource.getRepository(CartItem);
      testCartItem = cartItemRepository.create({
        cart: testCart,
        product: testProduct,
        quantity: 2
      });
      
      const savedCartItem = await cartItemRepository.save(testCartItem);
      cartItemId = savedCartItem.id;
    } catch (error) {
      console.error('Error creating test cart and cart item:', error);
    }
  });

  afterEach(async () => {
    // Clean up test cart items and carts after each test
    await removeTestCartItems();
    await removeTestCarts();
  });

  afterAll(async () => {
    // Final cleanup
    await removeTestCartItems();
    await removeTestCarts();
    
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

  describe('GET /api/carts/user/:userId', () => {
    it('should return cart for a specific user', async () => {
      jest.setTimeout(10000); // 10 seconds timeout for this test
      
      const response = await request(app).get(`/api/carts/user/${userId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', cartId);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', userId);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0]).toHaveProperty('quantity', 2);
      expect(response.body.data.items[0]).toHaveProperty('product');
      expect(response.body.data.items[0].product).toHaveProperty('id', productId);
    });

    it('should return 404 if cart for user not found', async () => {
      const nonExistentId = 9999;
      const response = await request(app).get(`/api/carts/user/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/carts', () => {
    it('should create a new cart for a user', async () => {
      // First, delete the existing test cart
      await removeTestCartItems();
      await removeTestCarts();
      
      const newCart = {
        userId: userId
      };
      
      const response = await request(app)
        .post('/api/carts')
        .send(newCart);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', userId);
      
      // Update cartId for later tests
      cartId = response.body.data.id;
    });

    it('should return 400 if cart already exists for user', async () => {
      const newCart = {
        userId: userId
      };
      
      const response = await request(app)
        .post('/api/carts')
        .send(newCart);
      
      expect(response.status).toBe(400);
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteCart = {
        // Missing userId
      };
      
      const response = await request(app)
        .post('/api/carts')
        .send(incompleteCart);
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/carts/:cartId/items', () => {
    it('should add an item to the cart', async () => {
      const newItem = {
        productId: productId,
        quantity: 3
      };
      
      const response = await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send(newItem);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('quantity', 3);
      expect(response.body.data).toHaveProperty('product');
      expect(response.body.data.product).toHaveProperty('id', productId);
    });

    it('should return 404 if cart not found', async () => {
      const nonExistentId = 9999;
      const newItem = {
        productId: productId,
        quantity: 3
      };
      
      const response = await request(app)
        .post(`/api/carts/${nonExistentId}/items`)
        .send(newItem);
      
      expect(response.status).toBe(404);
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteItem = {
        // Missing productId and quantity
      };
      
      const response = await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send(incompleteItem);
      
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/carts/:cartId/items/:itemId', () => {
    it('should update a cart item quantity', async () => {
      const updateData = {
        quantity: 5
      };
      
      const response = await request(app)
        .patch(`/api/carts/${cartId}/items/${cartItemId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', cartItemId);
      expect(response.body.data).toHaveProperty('quantity', 5);
    });

    it('should return 404 if cart item not found', async () => {
      const nonExistentId = 9999;
      const updateData = { quantity: 10 };
      
      const response = await request(app)
        .patch(`/api/carts/${cartId}/items/${nonExistentId}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
    });

    it('should return validation error if required fields are missing', async () => {
      const incompleteUpdate = {
        // Missing quantity
      };
      
      const response = await request(app)
        .patch(`/api/carts/${cartId}/items/${cartItemId}`)
        .send(incompleteUpdate);
      
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/carts/:cartId/items/:itemId', () => {
    it('should remove an item from the cart', async () => {
      const response = await request(app)
        .delete(`/api/carts/${cartId}/items/${cartItemId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify item is removed
      const cartResponse = await request(app).get(`/api/carts/user/${userId}`);
      expect(cartResponse.status).toBe(200);
      expect(cartResponse.body.data.items.length).toBe(0);
    });

    it('should return 404 if cart item not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/carts/${cartId}/items/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/carts/:cartId', () => {
    it('should clear the entire cart', async () => {
      const response = await request(app)
        .delete(`/api/carts/${cartId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify cart is cleared (items removed but cart still exists)
      const cartResponse = await request(app).get(`/api/carts/user/${userId}`);
      expect(cartResponse.status).toBe(200);
      expect(cartResponse.body.data.items.length).toBe(0);
    });

    it('should return 404 if cart not found', async () => {
      const nonExistentId = 9999;
      
      const response = await request(app)
        .delete(`/api/carts/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});