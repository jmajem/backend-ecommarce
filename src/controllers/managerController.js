const managerService = require("../services/managerService");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

/**
 * @swagger
 * /api/managers:
 *   post:
 *     summary: Create a new manager
 *     tags: [Managers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - phoneNumber
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Manager created successfully
 */
exports.createManager = catchAsync(async (req, res, next) => {
  const manager = await managerService.createManager(req.body);
  res.status(201).json({
    status: "success",
    data: manager,
  });
});

/**
 * @swagger
 * /api/managers:
 *   get:
 *     summary: Get all managers
 *     tags: [Managers]
 *     responses:
 *       200:
 *         description: List of all managers
 */
exports.getAllManagers = catchAsync(async (req, res, next) => {
  const managers = await managerService.getAllManagers();
  res.status(200).json({
    status: "success",
    results: managers.length,
    data: managers,
  });
});

/**
 * @swagger
 * /api/managers/{id}:
 *   get:
 *     summary: Get a manager by ID
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Manager details
 *       404:
 *         description: Manager not found
 */
exports.getManager = catchAsync(async (req, res, next) => {
  const manager = await managerService.getManager(req.params.id);
  res.status(200).json({
    status: "success",
    data: manager,
  });
});

/**
 * @swagger
 * /api/managers/{id}:
 *   patch:
 *     summary: Update a manager
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manager updated successfully
 *       404:
 *         description: Manager not found
 */
exports.updateManager = catchAsync(async (req, res, next) => {
  const manager = await managerService.updateManager(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: manager,
  });
});

/**
 * @swagger
 * /api/managers/{id}:
 *   delete:
 *     summary: Delete a manager
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Manager deleted successfully
 *       404:
 *         description: Manager not found
 */
exports.deleteManager = catchAsync(async (req, res, next) => {
  await managerService.deleteManager(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/managers/email/{email}:
 *   get:
 *     summary: Get a manager by email
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manager details
 *       404:
 *         description: Manager not found
 */
exports.getManagerByEmail = catchAsync(async (req, res, next) => {
  const manager = await managerService.getManagerByEmail(req.params.email);
  res.status(200).json({
    status: "success",
    data: manager,
  });
});

/**
 * @swagger
 * /api/managers/{id}/password:
 *   patch:
 *     summary: Update manager password
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 *       404:
 *         description: Manager not found
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const manager = await managerService.updatePassword(
    req.params.id,
    currentPassword,
    newPassword
  );
  res.status(200).json({
    status: "success",
    data: manager,
  });
});

/**
 * @swagger
 * /api/managers/{id}/status:
 *   patch:
 *     summary: Update manager status
 *     tags: [Managers]
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
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Manager not found
 */
exports.updateStatus = catchAsync(async (req, res) => {
  const manager = await managerService.updateStatus(
    req.params.id,
    req.body.isActive
  );
  res.status(200).json({
    status: "success",
    data: manager,
  });
});

/**
 * @swagger
 * /api/managers/{id}/permissions:
 *   patch:
 *     summary: Update manager permissions
 *     tags: [Managers]
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
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [MANAGE_USERS, MANAGE_PRODUCTS, MANAGE_ORDERS, MANAGE_CATEGORIES, MANAGE_SELLERS, VIEW_REPORTS]
 *     responses:
 *       200:
 *         description: Permissions updated successfully
 *       404:
 *         description: Manager not found
 */
exports.updatePermissions = catchAsync(async (req, res) => {
  const manager = await managerService.updatePermissions(
    req.params.id,
    req.body.permissions
  );
  res.status(200).json({
    status: "success",
    data: manager,
  });
});
