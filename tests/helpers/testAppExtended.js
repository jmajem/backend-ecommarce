const express = require('express');
const { TestDataSource } = require('../../src/config/database.test');
const User = require('../../src/entities/User');
const Product = require('../../src/entities/Product');
const Category = require('../../src/entities/Category');
const Cart = require('../../src/entities/Cart');
const CartItem = require('../../src/entities/CartItem');
const Store = require('../../src/entities/Store');
const Seller = require('../../src/entities/Seller');
const Order = require('../../src/entities/Order');
const Comment = require('../../src/entities/Comment');
const CommentReply = require('../../src/entities/CommentReply');
const Invoice = require('../../src/entities/Invoice');
const Manager = require('../../src/entities/Manager');
const ProductCategory = require('../../src/entities/ProductCategory');

// Create a mock Express app for testing
const app = express();
app.use(express.json());

// Basic request logging for tests
app.use((req, res, next) => {
  console.log(`Test app received: ${req.method} ${req.url}`);
  next();
});

/* USER ROUTES */
app.get('/api/users', async (req, res) => {
  try {
    const userRepository = TestDataSource.getRepository(User);
    const users = await userRepository.find();
    res.status(200).json({ 
      status: 'success', 
      data: users 
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const userRepository = TestDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.status(200).json({ 
      status: 'success', 
      data: user 
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    
    // Basic validation
    if (!userData.email || !userData.password || !userData.firstName || 
        !userData.lastName || !userData.phoneNumber) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }
    
    const userRepository = TestDataSource.getRepository(User);
    const user = userRepository.create(userData);
    const result = await userRepository.save(user);
    
    res.status(201).json({ 
      status: 'success', 
      data: result 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const userData = req.body;
    
    const userRepository = TestDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    userRepository.merge(user, userData);
    const result = await userRepository.save(user);
    
    res.status(200).json({ 
      status: 'success', 
      data: result 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const userRepository = TestDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    await userRepository.delete(id);
    
    res.status(200).json({ 
      status: 'success', 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

/* PRODUCT ROUTES */
app.get('/api/products', async (req, res) => {
  try {
    const productRepository = TestDataSource.getRepository(Product);
    const products = await productRepository.find({
      relations: ['categories']
    });
    
    res.status(200).json({
      status: 'success',
      data: products
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const productRepository = TestDataSource.getRepository(Product);
    const product = await productRepository.findOne({
      where: { id },
      relations: ['categories']
    });
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    console.error('Error getting product by ID:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const productData = req.body;
    
    // Basic validation
    if (!productData.productName || !productData.productImage || !productData.productStatus || 
        !productData.standardPrice || !productData.productDescription || !productData.storeId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }
    
    // Create product
    const productRepository = TestDataSource.getRepository(Product);
    const product = productRepository.create(productData);
    
    const result = await productRepository.save(product);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.patch('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const productData = req.body;
    
    // Get product
    const productRepository = TestDataSource.getRepository(Product);
    const product = await productRepository.findOne({
      where: { id }
    });
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    // Update product
    productRepository.merge(product, productData);
    const result = await productRepository.save(product);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Get product
    const productRepository = TestDataSource.getRepository(Product);
    const product = await productRepository.findOne({ where: { id } });
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    // Delete product
    await productRepository.delete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/* CATEGORY ROUTES */
app.get('/api/categories', async (req, res) => {
  try {
    const categoryRepository = TestDataSource.getRepository(Category);
    const categories = await categoryRepository.find();
    
    res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const categoryRepository = TestDataSource.getRepository(Category);
    const category = await categoryRepository.findOne({ where: { id } });
    
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (error) {
    console.error('Error getting category by ID:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const categoryData = req.body;
    
    // Basic validation
    if (!categoryData.name) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }
    
    // Create category
    const categoryRepository = TestDataSource.getRepository(Category);
    const category = categoryRepository.create(categoryData);
    const result = await categoryRepository.save(category);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.patch('/api/categories/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const categoryData = req.body;
    
    // Get category
    const categoryRepository = TestDataSource.getRepository(Category);
    const category = await categoryRepository.findOne({ where: { id } });
    
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }
    
    // Update category
    categoryRepository.merge(category, categoryData);
    const result = await categoryRepository.save(category);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Get category
    const categoryRepository = TestDataSource.getRepository(Category);
    const category = await categoryRepository.findOne({ where: { id } });
    
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }
    
    // Delete category
    await categoryRepository.delete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/* CART ROUTES */
app.get('/api/carts/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartRepository = TestDataSource.getRepository(Cart);
    
    const cart = await cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.product']
    });
    
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found for this user'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.post('/api/carts', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'User ID is required'
      });
    }
    
    const userRepository = TestDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    const cartRepository = TestDataSource.getRepository(Cart);
    const existingCart = await cartRepository.findOne({ where: { user: { id: userId } } });
    
    if (existingCart) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cart already exists for this user'
      });
    }
    
    const cart = cartRepository.create({ user });
    const result = await cartRepository.save(cart);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.post('/api/carts/:cartId/items', async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product ID and quantity are required'
      });
    }
    
    const cartRepository = TestDataSource.getRepository(Cart);
    const productRepository = TestDataSource.getRepository(Product);
    
    const cart = await cartRepository.findOne({ where: { id: cartId } });
    const product = await productRepository.findOne({ where: { id: productId } });
    
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    const cartItemRepository = TestDataSource.getRepository(CartItem);
    const cartItem = cartItemRepository.create({
      cart,
      product,
      quantity
    });
    
    const result = await cartItemRepository.save(cartItem);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.patch('/api/carts/:cartId/items/:itemId', async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quantity is required'
      });
    }
    
    const cartItemRepository = TestDataSource.getRepository(CartItem);
    const cartItem = await cartItemRepository.findOne({ 
      where: { id: itemId, cart: { id: cartId } } 
    });
    
    if (!cartItem) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart item not found'
      });
    }
    
    cartItemRepository.merge(cartItem, { quantity });
    const result = await cartItemRepository.save(cartItem);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.delete('/api/carts/:cartId/items/:itemId', async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    
    const cartItemRepository = TestDataSource.getRepository(CartItem);
    const cartItem = await cartItemRepository.findOne({ 
      where: { id: itemId, cart: { id: cartId } } 
    });
    
    if (!cartItem) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart item not found'
      });
    }
    
    await cartItemRepository.delete(itemId);
    
    res.status(200).json({
      status: 'success',
      message: 'Cart item removed successfully'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.delete('/api/carts/:cartId', async (req, res) => {
  try {
    const cartId = req.params.cartId;
    
    const cartRepository = TestDataSource.getRepository(Cart);
    const cart = await cartRepository.findOne({ where: { id: cartId } });
    
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }
    
    const cartItemRepository = TestDataSource.getRepository(CartItem);
    await cartItemRepository.delete({ cart: { id: cartId } });
    
    res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/* COMMENTS ROUTES */
app.get('/api/comments', async (req, res) => {
  try {
    const commentRepository = TestDataSource.getRepository(Comment);
    const comments = await commentRepository.find({
      relations: ['user', 'product']
    });
    
    res.status(200).json({
      status: 'success',
      data: comments
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/comments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const commentRepository = TestDataSource.getRepository(Comment);
    
    const comment = await commentRepository.findOne({
      where: { id },
      relations: ['user', 'product']
    });
    
    if (!comment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Comment not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: comment
    });
  } catch (error) {
    console.error('Error getting comment by ID:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/comments/product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const commentRepository = TestDataSource.getRepository(Comment);
    
    const comments = await commentRepository.find({
      where: { product: { id: productId } },
      relations: ['user', 'product']
    });
    
    res.status(200).json({
      status: 'success',
      data: comments
    });
  } catch (error) {
    console.error('Error getting comments by product ID:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('/api/comments/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const commentRepository = TestDataSource.getRepository(Comment);
    
    const comments = await commentRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'product']
    });
    
    res.status(200).json({
      status: 'success',
      data: comments
    });
  } catch (error) {
    console.error('Error getting comments by user ID:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const { content, rating, userId, productId } = req.body;
    
    if (!content || !rating || !userId || !productId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Content, rating, user ID, and product ID are required'
      });
    }
    
    const userRepository = TestDataSource.getRepository(User);
    const productRepository = TestDataSource.getRepository(Product);
    
    const user = await userRepository.findOne({ where: { id: userId } });
    const product = await productRepository.findOne({ where: { id: productId } });
    
    if (!user || !product) {
      return res.status(404).json({
        status: 'fail',
        message: 'User or product not found'
      });
    }
    
    const commentRepository = TestDataSource.getRepository(Comment);
    const comment = commentRepository.create({
      content,
      rating,
      user,
      product
    });
    
    const result = await commentRepository.save(comment);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.patch('/api/comments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        status: 'fail',
        message: 'Content is required'
      });
    }
    
    const commentRepository = TestDataSource.getRepository(Comment);
    const comment = await commentRepository.findOne({ where: { id } });
    
    if (!comment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Comment not found'
      });
    }
    
    commentRepository.merge(comment, { content });
    const result = await commentRepository.save(comment);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    const commentRepository = TestDataSource.getRepository(Comment);
    const comment = await commentRepository.findOne({ where: { id } });
    
    if (!comment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Comment not found'
      });
    }
    
    await commentRepository.delete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

const startTestServer = () => {
  const server = app.listen(0); // Random available port
  return server;
};

module.exports = { app, startTestServer };