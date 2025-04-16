const { getRepository } = require("typeorm");
const User = require("../entities/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

class UserService {
  getRepository() {
    return getRepository(User);
  }

  // Create a new user
  async createUser(userData) {
    try {
      const user = this.getRepository().create(userData);
      return await this.getRepository().save(user);
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError("Email already exists", 400);
      }
      throw error;
    }
  }

  // Get all users
  async getAllUsers() {
    return await this.getRepository().find();
  }

  // Get user by ID
  async getUserById(id) {
    const user = await this.getRepository().findOne({ where: { id } });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  // Update user
  async updateUser(id, userData) {
    const user = await this.getUserById(id);
    Object.assign(user, userData);
    return await this.getRepository().save(user);
  }

  // Delete user
  async deleteUser(id) {
    const user = await this.getUserById(id);
    await this.getRepository().remove(user);
    return { message: "User deleted successfully" };
  }
}

module.exports = new UserService();
