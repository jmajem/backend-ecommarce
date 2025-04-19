const reviewReplyService = require("../services/reviewReplyService");
const catchAsync = require("../utils/catchAsync");

/**
 * @swagger
 * /api/reviews/{reviewId}/replies:
 *   post:
 *     summary: Create a new reply to a review
 *     tags: [ReviewReplies]
 *     parameters:
 *       - in: path
 *         name: reviewId
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
 *               - content
 *               - userId
 *             properties:
 *               content:
 *                 type: string
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Reply created successfully
 */
exports.createReply = catchAsync(async (req, res) => {
  const replyData = {
    ...req.body,
    reviewId: req.params.reviewId,
  };
  const reply = await reviewReplyService.createReply(replyData);
  res.status(201).json({
    status: "success",
    data: reply,
  });
});

/**
 * @swagger
 * /api/reviews/{reviewId}/replies:
 *   get:
 *     summary: Get all replies for a review
 *     tags: [ReviewReplies]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of replies for the review
 */
exports.getRepliesByReview = catchAsync(async (req, res) => {
  const replies = await reviewReplyService.getRepliesByReview(
    req.params.reviewId
  );
  res.status(200).json({
    status: "success",
    data: replies,
  });
});

/**
 * @swagger
 * /api/replies/{id}:
 *   get:
 *     summary: Get a reply by ID
 *     tags: [ReviewReplies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reply details
 *       404:
 *         description: Reply not found
 */
exports.getReply = catchAsync(async (req, res) => {
  const reply = await reviewReplyService.getReply(req.params.id);
  res.status(200).json({
    status: "success",
    data: reply,
  });
});

/**
 * @swagger
 * /api/replies/{id}:
 *   patch:
 *     summary: Update a reply
 *     tags: [ReviewReplies]
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *       404:
 *         description: Reply not found
 */
exports.updateReply = catchAsync(async (req, res) => {
  const reply = await reviewReplyService.updateReply(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: reply,
  });
});

/**
 * @swagger
 * /api/replies/{id}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [ReviewReplies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Reply deleted successfully
 *       404:
 *         description: Reply not found
 */
exports.deleteReply = catchAsync(async (req, res) => {
  await reviewReplyService.deleteReply(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/users/{userId}/replies:
 *   get:
 *     summary: Get all replies by a user
 *     tags: [ReviewReplies]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of replies by the user
 */
exports.getRepliesByUser = catchAsync(async (req, res) => {
  const replies = await reviewReplyService.getRepliesByUser(req.params.userId);
  res.status(200).json({
    status: "success",
    data: replies,
  });
});
