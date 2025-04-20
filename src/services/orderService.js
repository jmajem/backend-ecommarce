const { Order } = require("../entities");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { AppDataSource } = require("../config/database");

const orderRepository = AppDataSource.getRepository(Order);

exports.createOrder = catchAsync(async (orderData) => {
  const order = orderRepository.create(orderData);
  return await orderRepository.save(order);
});

exports.getAllOrders = catchAsync(async () => {
  return await orderRepository.find({
    relations: ["user", "cart"],
  });
});

exports.getOrderById = catchAsync(async (id) => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: ["user", "cart"],
  });

  if (!order) {
    throw new AppError("No order found with that ID", 404);
  }

  return order;
});

exports.updateOrder = catchAsync(async (id, updateData) => {
  const order = await orderRepository.findOne({
    where: { id },
  });

  if (!order) {
    throw new AppError("No order found with that ID", 404);
  }

  Object.assign(order, updateData);
  return await orderRepository.save(order);
});

exports.deleteOrder = catchAsync(async (id) => {
  const order = await orderRepository.findOne({
    where: { id },
  });

  if (!order) {
    throw new AppError("No order found with that ID", 404);
  }

  await orderRepository.remove(order);
});

exports.getOrdersByUser = catchAsync(async (userId) => {
  return await orderRepository.find({
    where: { userId },
    relations: ["user", "cart"],
  });
});

exports.getOrdersByStatus = catchAsync(async (status) => {
  return await orderRepository.find({
    where: { orderStatus: status },
    relations: ["user", "cart"],
  });
});

exports.updateOrderStatus = catchAsync(async (id, status) => {
  const order = await orderRepository.findOne({
    where: { id },
  });

  if (!order) {
    throw new AppError("No order found with that ID", 404);
  }

  order.orderStatus = status;
  return await orderRepository.save(order);
});
