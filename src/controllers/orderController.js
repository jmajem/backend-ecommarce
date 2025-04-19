const orderService = require("../services/orderService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderNumber
 *               - orderStatus
 *               - orderDate
 *               - cartId
 *               - paymentInfo
 *               - country
 *               - city
 *               - streetAddress
 *               - userId
 *               - phoneNumber
 *               - email
 *             properties:
 *               orderNumber:
 *                 type: string
 *               orderStatus:
 *                 type: string
 *               orderDate:
 *                 type: string
 *                 format: date
 *               cartId:
 *                 type: integer
 *               paymentInfo:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               userId:
 *                 type: integer
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
exports.createOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.createOrder(req.body);
  res.status(201).json({
    status: "success",
    data: {
      order,
    },
  });
});

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 */
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getAllOrders();
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.getOrderById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

/**
 * @swagger
 * /api/v1/orders/user/{userId}:
 *   get:
 *     summary: Get orders by user ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's orders
 */
exports.getOrdersByUser = catchAsync(async (req, res, next) => {
  const orders = await orderService.getOrdersByUser(req.params.userId);
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   patch:
 *     summary: Update an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderStatus:
 *                 type: string
 *               paymentInfo:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.updateOrder(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
exports.deleteOrder = catchAsync(async (req, res, next) => {
  await orderService.deleteOrder(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       404:
 *         description: Order not found
 */
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.status
  );
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});
