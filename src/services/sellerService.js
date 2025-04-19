const Seller = require("../entities/Seller");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create a new seller
exports.createSeller = catchAsync(async (sellerData) => {
  const seller = await Seller.create(sellerData);
  return seller;
});

// Get all sellers
exports.getAllSellers = catchAsync(async () => {
  const sellers = await Seller.find();
  return sellers;
});

// Get seller by ID
exports.getSeller = catchAsync(async (id) => {
  const seller = await Seller.findById(id);
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  return seller;
});

// Update seller
exports.updateSeller = catchAsync(async (id, updateData) => {
  const seller = await Seller.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  return seller;
});

// Delete seller
exports.deleteSeller = catchAsync(async (id) => {
  const seller = await Seller.findByIdAndDelete(id);
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
});

// Get sellers by user ID
exports.getSellersByUser = catchAsync(async (userId) => {
  const sellers = await Seller.find({ userId });
  return sellers;
});

// Get sellers by store ID
exports.getSellersByStore = catchAsync(async (storeId) => {
  const sellers = await Seller.find({ storeId });
  return sellers;
});

// Get store by seller ID
exports.getStoreBySeller = catchAsync(async (sellerId) => {
  const seller = await Seller.findById(sellerId).populate("store");
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  return seller.store;
});

// Get user by seller ID
exports.getUserBySeller = catchAsync(async (sellerId) => {
  const seller = await Seller.findById(sellerId).populate("user");
  if (!seller) {
    throw new AppError("No seller found with that ID", 404);
  }
  return seller.user;
});
