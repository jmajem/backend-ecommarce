const { getRepository } = require("typeorm");
const Category = require("../entities/Category");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

class CategoryService {
  getRepository() {
    return getRepository(Category);
  }

  // Create a new category
  async createCategory(categoryData) {
    try {
      const category = this.getRepository().create(categoryData);
      return await this.getRepository().save(category);
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError("Category already exists", 400);
      }
      throw error;
    }
  }

  // Get all categories
  async getAllCategories() {
    return await this.getRepository().find();
  }

  // Get category by ID
  async getCategoryById(id) {
    const category = await this.getRepository().findOne({ where: { id } });
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return category;
  }

  // Update category
  async updateCategory(id, categoryData) {
    const category = await this.getCategoryById(id);
    Object.assign(category, categoryData);
    return await this.getRepository().save(category);
  }

  // Delete category
  async deleteCategory(id) {
    const category = await this.getCategoryById(id);
    await this.getRepository().remove(category);
    return { message: "Category deleted successfully" };
  }
}

module.exports = new CategoryService();
