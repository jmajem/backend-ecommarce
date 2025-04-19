const express = require("express");
const cartController = require("../controllers/cartController");

const router = express.Router();

// Base routes
router
  .route("/")
  .post(cartController.createCart)
  .get(cartController.getAllCarts);

// Routes with ID
router
  .route("/:id")
  .get(cartController.getCart)
  .patch(cartController.updateCart)
  .delete(cartController.deleteCart);

// Cart items routes
router
  .route("/:id/items")
  .get(cartController.getCartItems)
  .post(cartController.addCartItem);

router
  .route("/:id/items/:itemId")
  .patch(cartController.updateCartItem)
  .delete(cartController.removeCartItem);

// Special routes
router.get("/user/:userId", cartController.getUserCart);
router.post("/:id/checkout", cartController.checkoutCart);

module.exports = router;
