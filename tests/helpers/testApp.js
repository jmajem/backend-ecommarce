const express = require('express');
const { TestDataSource } = require('../../src/config/database.test');
const User = require('../../src/entities/User');
const Product = require('../../src/entities/Product');
const Category = require('../../src/entities/Category');

// Create a mock Express app for testing
const app = express();
app.use(express.json());

// Basic request logging for tests
app.use((req, res, next) => {
  console.log(`Test app received: ${req.method} ${req.url}`);
  next();
});

// Simple user routes for testing
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

// Product routes for testing
app.get('/api/products', async (req, res) => {
  try {
    const productRepository = TestDataSource.getRepository(Product);
    const products = await productRepository.find({
      relations: ['categories']
    });
    res.status(200).json({ 
      status: 'success', 
      data: {
        products
      }
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
      data: {
        product
      }
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
    const { categoryIds, ...productDetails } = productData;
    
    // Basic validation
    if (!productDetails.productName || !productDetails.productImage || 
        !productDetails.productStatus || !productDetails.standardPrice ||
        !productDetails.offerPrice || !productDetails.productDescription ||
        !productDetails.productDate || !productDetails.productQuantity ||
        !productDetails.storeId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }
    
    const productRepository = TestDataSource.getRepository(Product);
    const product = productRepository.create(productDetails);
    const savedProduct = await productRepository.save(product);
    
    // Add categories if provided
    if (categoryIds && categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        await productRepository
          .createQueryBuilder()
          .relation(Product, "categories")
          .of(savedProduct.id)
          .add(categoryId);
      }
    }
    
    // Fetch the product with categories
    const productWithCategories = await productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['categories']
    });
    
    res.status(201).json({ 
      status: 'success', 
      data: {
        product: productWithCategories
      }
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
    const { categoryIds, ...productDetails } = productData;
    
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
    
    productRepository.merge(product, productDetails);
    const updatedProduct = await productRepository.save(product);
    
    // Update categories if provided
    if (categoryIds) {
      // Remove all existing categories
      for (const category of product.categories) {
        await productRepository
          .createQueryBuilder()
          .relation(Product, "categories")
          .of(id)
          .remove(category.id);
      }
      
      // Add new categories
      for (const categoryId of categoryIds) {
        await productRepository
          .createQueryBuilder()
          .relation(Product, "categories")
          .of(id)
          .add(categoryId);
      }
    }
    
    // Fetch the product with updated categories
    const productWithCategories = await productRepository.findOne({
      where: { id },
      relations: ['categories']
    });
    
    res.status(200).json({ 
      status: 'success', 
      data: {
        product: productWithCategories
      }
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
    const productRepository = TestDataSource.getRepository(Product);
    const product = await productRepository.findOne({ where: { id } });
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    await productRepository.delete(id);
    
    res.status(204).json({ 
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

app.post('/api/products/:id/categories/:categoryId', async (req, res) => {
  try {
    const productId = req.params.id;
    const categoryId = req.params.categoryId;
    
    const productRepository = TestDataSource.getRepository(Product);
    const product = await productRepository.findOne({ 
      where: { id: productId },
      relations: ['categories'] 
    });
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    const categoryRepository = TestDataSource.getRepository(Category);
    const category = await categoryRepository.findOne({ where: { id: categoryId } });
    
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }
    
    await productRepository
      .createQueryBuilder()
      .relation(Product, "categories")
      .of(productId)
      .add(categoryId);
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Category added to product successfully' 
    });
  } catch (error) {
    console.error('Error adding category to product:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

app.delete('/api/products/:id/categories/:categoryId', async (req, res) => {
  try {
    const productId = req.params.id;
    const categoryId = req.params.categoryId;
    
    const productRepository = TestDataSource.getRepository(Product);
    const product = await productRepository.findOne({ 
      where: { id: productId },
      relations: ['categories'] 
    });
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    const categoryRepository = TestDataSource.getRepository(Category);
    const category = await categoryRepository.findOne({ where: { id: categoryId } });
    
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }
    
    await productRepository
      .createQueryBuilder()
      .relation(Product, "categories")
      .of(productId)
      .remove(categoryId);
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Category removed from product successfully' 
    });
  } catch (error) {
    console.error('Error removing category from product:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

app.get('/api/products/store/:storeId', async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const productRepository = TestDataSource.getRepository(Product);
    const products = await productRepository.find({
      where: { storeId },
      relations: ['categories']
    });
    
    res.status(200).json({ 
      status: 'success', 
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Error getting products by store:', error);
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