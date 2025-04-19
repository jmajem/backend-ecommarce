const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router
  .route("/")
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

router.route("/user/:userId").get(orderController.getOrdersByUser);

router.route("/:id/status").patch(orderController.updateOrderStatus);

module.exports = router;
