const express = require("express");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

// Base routes
router
  .route("/")
  .post(reviewController.createReview)
  .get(reviewController.getAllReviews);

// Routes with ID
router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

// Special routes
router.get("/product/:productId", reviewController.getReviewsByProduct);
router.get("/user/:userId", reviewController.getReviewsByUser);
router.get(
  "/product/:productId/average",
  reviewController.getProductAverageRating
);

module.exports = router;
