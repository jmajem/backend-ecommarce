const invoiceService = require("../services/invoiceService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * @swagger
 * /api/v1/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceSales
 *               - invoiceDate
 *               - invoiceTotalPrice
 *               - invoiceOrderNumber
 *               - invoicePaymentType
 *               - invoicePaymentStatus
 *               - sellerId
 *               - userId
 *               - orderId
 *             properties:
 *               invoiceSales:
 *                 type: string
 *               invoiceDate:
 *                 type: string
 *               invoiceTotalPrice:
 *                 type: number
 *                 format: decimal
 *               invoiceOrderNumber:
 *                 type: string
 *               invoicePaymentType:
 *                 type: string
 *               invoicePaymentStatus:
 *                 type: string
 *               sellerId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               orderId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */
exports.createInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(201).json({
    status: "success",
    data: {
      invoice,
    },
  });
});

/**
 * @swagger
 * /api/v1/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: List of invoices
 */
exports.getAllInvoices = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getAllInvoices();
  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: {
      invoices,
    },
  });
});

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   get:
 *     summary: Get an invoice by ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice details
 *       404:
 *         description: Invoice not found
 */
exports.getInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      invoice,
    },
  });
});

/**
 * @swagger
 * /api/v1/invoices/user/{userId}:
 *   get:
 *     summary: Get invoices by user ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's invoices
 */
exports.getInvoicesByUser = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getInvoicesByUser(req.params.userId);
  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: {
      invoices,
    },
  });
});

/**
 * @swagger
 * /api/v1/invoices/seller/{sellerId}:
 *   get:
 *     summary: Get invoices by seller ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of seller's invoices
 */
exports.getInvoicesBySeller = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getInvoicesBySeller(
    req.params.sellerId
  );
  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: {
      invoices,
    },
  });
});

/**
 * @swagger
 * /api/v1/invoices/order/{orderId}:
 *   get:
 *     summary: Get invoices by order ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of order's invoices
 */
exports.getInvoicesByOrder = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getInvoicesByOrder(req.params.orderId);
  res.status(200).json({
    status: "success",
    results: invoices.length,
    data: {
      invoices,
    },
  });
});

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   patch:
 *     summary: Update an invoice
 *     tags: [Invoices]
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
 *               invoiceSales:
 *                 type: string
 *               invoiceDate:
 *                 type: string
 *               invoiceTotalPrice:
 *                 type: number
 *                 format: decimal
 *               invoicePaymentType:
 *                 type: string
 *               invoicePaymentStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       404:
 *         description: Invoice not found
 */
exports.updateInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: {
      invoice,
    },
  });
});

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   delete:
 *     summary: Delete an invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 */
exports.deleteInvoice = catchAsync(async (req, res, next) => {
  await invoiceService.deleteInvoice(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/v1/invoices/{id}/payment-status:
 *   patch:
 *     summary: Update invoice payment status
 *     tags: [Invoices]
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
 *         description: Invoice payment status updated successfully
 *       404:
 *         description: Invoice not found
 */
exports.updateInvoicePaymentStatus = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.updateInvoicePaymentStatus(
    req.params.id,
    req.body.status
  );
  res.status(200).json({
    status: "success",
    data: {
      invoice,
    },
  });
});
