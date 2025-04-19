const { AppDataSource } = require("../config/database");
const Order = require("../entities/Order");
const AppError = require("../utils/AppError");

const orderRepository = AppDataSource.getRepository(Order);

exports.createOrder = async (orderData) => {
  const order = orderRepository.create(orderData);
  return await orderRepository.save(order);
};

exports.getAllOrders = async () => {
  return await orderRepository.find({
    relations: ["user", "cart"],
  });
};

exports.getOrderById = async (id) => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: ["user", "cart"],
  });
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  return order;
};

exports.getOrdersByUser = async (userId) => {
  return await orderRepository.find({
    where: { userId },
    relations: ["user", "cart"],
  });
};

exports.updateOrder = async (id, orderData) => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: ["user", "cart"],
  });
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  Object.assign(order, orderData);
  return await orderRepository.save(order);
};

exports.deleteOrder = async (id) => {
  const result = await orderRepository.delete(id);
  if (result.affected === 0) {
    throw new AppError("Order not found", 404);
  }
};

exports.updateOrderStatus = async (id, status) => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: ["user", "cart"],
  });
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  order.orderStatus = status;
  return await orderRepository.save(order);
};
