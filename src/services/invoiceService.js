const { AppDataSource } = require("../config/database");
const Invoice = require("../entities/Invoice");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const invoiceRepository = AppDataSource.getRepository(Invoice);

// Create a new invoice
exports.createInvoice = catchAsync(async (invoiceData) => {
  const invoice = invoiceRepository.create(invoiceData);
  return await invoiceRepository.save(invoice);
});

// Get all invoices
exports.getAllInvoices = catchAsync(async () => {
  return await invoiceRepository.find({
    relations: ["seller", "user", "order"],
  });
});

// Get invoice by ID
exports.getInvoice = catchAsync(async (id) => {
  const invoice = await invoiceRepository.findOne({
    where: { id },
    relations: ["seller", "user", "order"],
  });
  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }
  return invoice;
});

// Get invoices by user ID
exports.getInvoicesByUser = catchAsync(async (userId) => {
  return await invoiceRepository.find({
    where: { userId },
    relations: ["seller", "user", "order"],
  });
});

// Get invoices by seller ID
exports.getInvoicesBySeller = catchAsync(async (sellerId) => {
  return await invoiceRepository.find({
    where: { sellerId },
    relations: ["seller", "user", "order"],
  });
});

// Get invoices by order ID
exports.getInvoicesByOrder = catchAsync(async (orderId) => {
  return await invoiceRepository.find({
    where: { orderId },
    relations: ["seller", "user", "order"],
  });
});

// Update invoice
exports.updateInvoice = catchAsync(async (id, updateData) => {
  const invoice = await invoiceRepository.findOne({
    where: { id },
    relations: ["seller", "user", "order"],
  });
  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }
  Object.assign(invoice, updateData);
  return await invoiceRepository.save(invoice);
});

// Delete invoice
exports.deleteInvoice = catchAsync(async (id) => {
  const result = await invoiceRepository.delete(id);
  if (result.affected === 0) {
    throw new AppError("No invoice found with that ID", 404);
  }
});

// Update invoice payment status
exports.updateInvoicePaymentStatus = catchAsync(async (id, paymentStatus) => {
  const invoice = await invoiceRepository.findOne({
    where: { id },
    relations: ["seller", "user", "order"],
  });
  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }
  invoice.invoicePaymentStatus = paymentStatus;
  return await invoiceRepository.save(invoice);
});
