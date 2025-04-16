const { getRepository } = require("typeorm");
const Product = require("../entities/Product");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { AppDataSource } = require("../config/database");
const Category = require("../entities/Category");

class ProductService {
  getRepository() {
    return getRepository(Product);
  }

  // Create a new product
  async createProduct(productData) {
    try {
      const product = this.getRepository().create(productData);
      return await this.getRepository().save(product);
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError("Product already exists", 400);
      }
      throw error;
    }
  }

  // Get all products
  async getAllProducts() {
    return await this.getRepository().find({
      relations: ["categories"],
    });
  }

  // Get product by ID
  async getProductById(id) {
    const product = await this.getRepository().findOne({
      where: { id },
      relations: ["categories"],
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  // Update product
  async updateProduct(id, productData) {
    const product = await this.getProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    Object.assign(product, productData);
    return await this.getRepository().save(product);
  }

  // Delete product
  async deleteProduct(id) {
    const result = await this.getRepository().delete(id);
    if (result.affected === 0) {
      throw new AppError("Product not found", 404);
    }
  }

  // Get products by store ID
  async getProductsByStoreId(storeId) {
    return await this.getRepository().find({ where: { storeId } });
  }

  // Category relationship methods
  async addCategoryToProduct(productId, categoryId) {
    const product = await this.getRepository().findOne({
      where: { id: productId },
      relations: ["categories"],
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const category = await AppDataSource.getRepository(Category).findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    product.categories = [...product.categories, category];
    return await this.getRepository().save(product);
  }

  async removeCategoryFromProduct(productId, categoryId) {
    const product = await this.getRepository().findOne({
      where: { id: productId },
      relations: ["categories"],
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    product.categories = product.categories.filter(
      (category) => category.id !== categoryId
    );
    return await this.getRepository().save(product);
  }
}

module.exports = new ProductService();
