const CommentReply = require("../entities/CommentReply");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create a new comment reply
exports.createCommentReply = catchAsync(async (replyData) => {
  const reply = await CommentReply.create(replyData);
  return reply;
});

// Get all comment replies
exports.getAllCommentReplies = catchAsync(async () => {
  const replies = await CommentReply.find();
  return replies;
});

// Get comment reply by ID
exports.getCommentReply = catchAsync(async (id) => {
  const reply = await CommentReply.findById(id);
  if (!reply) {
    throw new AppError("No comment reply found with that ID", 404);
  }
  return reply;
});

// Update comment reply
exports.updateCommentReply = catchAsync(async (id, updateData) => {
  const reply = await CommentReply.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!reply) {
    throw new AppError("No comment reply found with that ID", 404);
  }
  return reply;
});

// Delete comment reply
exports.deleteCommentReply = catchAsync(async (id) => {
  const reply = await CommentReply.findByIdAndDelete(id);
  if (!reply) {
    throw new AppError("No comment reply found with that ID", 404);
  }
});

// Get replies by comment ID
exports.getRepliesByComment = catchAsync(async (commentId) => {
  const replies = await CommentReply.find({ commentId });
  return replies;
});

// Get replies by user ID
exports.getRepliesByUser = catchAsync(async (userId) => {
  const replies = await CommentReply.find({ userId });
  return replies;
});
