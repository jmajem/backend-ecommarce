const reviewService = require("../services/reviewService");
const catchAsync = require("../utils/catchAsync");

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - productId
 *               - userId
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               productId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Review created successfully
 */
exports.createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(req.body);
  res.status(201).json({
    status: "success",
    data: review,
  });
});

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of all reviews
 */
exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await reviewService.getAllReviews();
  res.status(200).json({
    status: "success",
    data: reviews,
  });
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
exports.getReview = catchAsync(async (req, res) => {
  const review = await reviewService.getReview(req.params.id);
  res.status(200).json({
    status: "success",
    data: review,
  });
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   patch:
 *     summary: Update a review
 *     tags: [Reviews]
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
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       404:
 *         description: Review not found
 */
exports.updateReview = catchAsync(async (req, res) => {
  const review = await reviewService.updateReview(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: review,
  });
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
exports.deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReview(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews for the product
 */
exports.getReviewsByProduct = catchAsync(async (req, res) => {
  const reviews = await reviewService.getReviewsByProduct(req.params.productId);
  res.status(200).json({
    status: "success",
    data: reviews,
  });
});

/**
 * @swagger
 * /api/reviews/user/{userId}:
 *   get:
 *     summary: Get all reviews by a user
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews by the user
 */
exports.getReviewsByUser = catchAsync(async (req, res) => {
  const reviews = await reviewService.getReviewsByUser(req.params.userId);
  res.status(200).json({
    status: "success",
    data: reviews,
  });
});

/**
 * @swagger
 * /api/reviews/product/{productId}/average:
 *   get:
 *     summary: Get average rating for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Average rating for the product
 */
exports.getProductAverageRating = catchAsync(async (req, res) => {
  const averageRating = await reviewService.getProductAverageRating(
    req.params.productId
  );
  res.status(200).json({
    status: "success",
    data: { averageRating },
  });
});
