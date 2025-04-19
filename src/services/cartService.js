const Cart = require("../entities/Cart");
const CartItem = require("../entities/CartItem");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create a new cart
exports.createCart = catchAsync(async (cartData) => {
  const cart = await Cart.create(cartData);
  return cart;
});

// Get all carts
exports.getAllCarts = catchAsync(async () => {
  const carts = await Cart.find();
  return carts;
});

// Get cart by ID
exports.getCart = catchAsync(async (id) => {
  const cart = await Cart.findById(id);
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }
  return cart;
});

// Update cart
exports.updateCart = catchAsync(async (id, updateData) => {
  const cart = await Cart.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }
  return cart;
});

// Delete cart
exports.deleteCart = catchAsync(async (id) => {
  const cart = await Cart.findByIdAndDelete(id);
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }
});

// Get cart items
exports.getCartItems = catchAsync(async (cartId) => {
  const items = await CartItem.find({ cartId });
  return items;
});

// Add item to cart
exports.addCartItem = catchAsync(async (cartId, itemData) => {
  const item = await CartItem.create({
    ...itemData,
    cartId,
  });
  return item;
});

// Update cart item
exports.updateCartItem = catchAsync(async (itemId, updateData) => {
  const item = await CartItem.findByIdAndUpdate(itemId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    throw new AppError("No cart item found with that ID", 404);
  }
  return item;
});

// Remove item from cart
exports.removeCartItem = catchAsync(async (itemId) => {
  const item = await CartItem.findByIdAndDelete(itemId);
  if (!item) {
    throw new AppError("No cart item found with that ID", 404);
  }
});

// Get user's cart
exports.getUserCart = catchAsync(async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new AppError("No cart found for this user", 404);
  }
  return cart;
});

// Checkout cart
exports.checkoutCart = catchAsync(async (cartId) => {
  const cart = await Cart.findById(cartId);
  if (!cart) {
    throw new AppError("No cart found with that ID", 404);
  }

  // Here you would typically:
  // 1. Create an order
  // 2. Update product quantities
  // 3. Clear the cart
  // 4. Return the order details

  // For now, we'll just return a success message
  return { message: "Cart checked out successfully" };
});
