const { AppDataSource } = require("../config/database");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { Invoice } = require("../entities");

const invoiceRepository = AppDataSource.getRepository(Invoice);
const cartRepository = AppDataSource.getRepository("Cart");

// Create a new invoice
exports.createInvoice = catchAsync(async (invoiceData) => {
  const invoice = invoiceRepository.create(invoiceData);
  return await invoiceRepository.save(invoice);
});

// Get all invoices
exports.getAllInvoices = catchAsync(async () => {
  return await invoiceRepository.find({
    relations: ["user", "seller", "order"],
  });
});

// Get invoice by ID
exports.getInvoiceById = catchAsync(async (id) => {
  const invoice = await invoiceRepository.findOne({
    where: { id },
    relations: ["user", "seller", "order"],
  });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  return invoice;
});

// Update invoice
exports.updateInvoice = catchAsync(async (id, updateData) => {
  const invoice = await invoiceRepository.findOne({
    where: { id },
  });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  Object.assign(invoice, updateData);
  return await invoiceRepository.save(invoice);
});

// Delete invoice
exports.deleteInvoice = catchAsync(async (id) => {
  const invoice = await invoiceRepository.findOne({
    where: { id },
  });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  await invoiceRepository.remove(invoice);
  return invoice;
});

// Get invoices by user ID
exports.getInvoicesByUser = catchAsync(async (userId) => {
  const invoices = await invoiceRepository.find({
    where: { userId },
    relations: ["cart", "user", "seller"],
  });
  return invoices;
});

// Get invoices by seller ID
exports.getInvoicesBySeller = catchAsync(async (sellerId) => {
  const invoices = await invoiceRepository.find({
    where: { sellerId },
    relations: ["cart", "user", "seller"],
  });
  return invoices;
});

// Get invoice by cart ID
exports.getInvoiceByCart = catchAsync(async (cartId) => {
  const invoice = await invoiceRepository.findOne({
    where: { cartId },
    relations: ["cart", "user", "seller"],
  });

  if (!invoice) {
    throw new AppError("No invoice found for that cart", 404);
  }
  return invoice;
});

// Update invoice payment status
exports.updatePaymentStatus = catchAsync(async (id, status) => {
  const invoice = await invoiceRepository.findOne({
    where: { id },
    relations: ["cart", "user", "seller"],
  });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  invoice.status = status;
  if (status === "PAID") {
    invoice.paymentDate = new Date();
  }
  await invoiceRepository.save(invoice);
  return invoice;
});
