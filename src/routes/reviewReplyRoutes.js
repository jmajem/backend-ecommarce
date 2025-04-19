const express = require("express");
const reviewReplyController = require("../controllers/reviewReplyController");

const router = express.Router();

// Nested routes under reviews
router
  .route("/reviews/:reviewId/replies")
  .post(reviewReplyController.createReply)
  .get(reviewReplyController.getRepliesByReview);

// Base routes for replies
router
  .route("/replies/:id")
  .get(reviewReplyController.getReply)
  .patch(reviewReplyController.updateReply)
  .delete(reviewReplyController.deleteReply);

// Get replies by user
router.get("/users/:userId/replies", reviewReplyController.getRepliesByUser);

module.exports = router;
