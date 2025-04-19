const Comment = require("../entities/Comment");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create a new comment
exports.createComment = catchAsync(async (commentData) => {
  const comment = await Comment.create(commentData);
  return comment;
});

// Get all comments
exports.getAllComments = catchAsync(async () => {
  const comments = await Comment.find();
  return comments;
});

// Get comment by ID
exports.getComment = catchAsync(async (id) => {
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
  return comment;
});

// Update comment
exports.updateComment = catchAsync(async (id, updateData) => {
  const comment = await Comment.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
  return comment;
});

// Delete comment
exports.deleteComment = catchAsync(async (id) => {
  const comment = await Comment.findByIdAndDelete(id);
  if (!comment) {
    throw new AppError("No comment found with that ID", 404);
  }
});

// Get comments by product ID
exports.getCommentsByProduct = catchAsync(async (productId) => {
  const comments = await Comment.find({ productId });
  return comments;
});

// Get comments by user ID
exports.getCommentsByUser = catchAsync(async (userId) => {
  const comments = await Comment.find({ userId });
  return comments;
});

// Get average rating for a product
exports.getProductAverageRating = catchAsync(async (productId) => {
  const comments = await Comment.find({ productId });
  if (comments.length === 0) {
    return 0;
  }
  const totalRating = comments.reduce(
    (sum, comment) => sum + comment.rating,
    0
  );
  return totalRating / comments.length;
});
