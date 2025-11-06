/**
 * ==============================================
 * REVIEW CONTROLLER
 * ==============================================
 * Xử lý logic đánh giá sách
 * Author: DinhVanThuan-S1
 * Date: 2025-11-04
 */

const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Tạo đánh giá cho sách
 * @route   POST /api/reviews
 * @access  Private/Customer
 */
const createReview = asyncHandler(async (req, res) => {
  const { bookId, orderId, rating, title, comment, images } = req.body;
  
  // Kiểm tra sách tồn tại
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }
  
  // Kiểm tra đơn hàng tồn tại và thuộc về customer
  const order = await Order.findOne({
    _id: orderId,
    customer: req.user._id,
    status: 'delivered',
  });
  
  if (!order) {
    return res.status(400).json({
      success: false,
      message: 'Order not found or not delivered yet',
    });
  }
  
  // Kiểm tra đã mua sách này chưa
  const hasPurchased = order.items.some(
    (item) => item.book && item.book.toString() === bookId
  );
  
  if (!hasPurchased) {
    return res.status(400).json({
      success: false,
      message: 'You have not purchased this book',
    });
  }
  
  // Kiểm tra đã review chưa
  const existingReview = await Review.findOne({
    customer: req.user._id,
    book: bookId,
    order: orderId,
  });
  
  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this book for this order',
    });
  }
  
  // Tạo review
  const review = await Review.create({
    customer: req.user._id,
    book: bookId,
    order: orderId,
    rating,
    title,
    comment,
    images: images || [],
    isVerified: true, // Verified vì đã mua hàng
  });
  
  // Populate customer info
  await review.populate('customer', 'fullName avatar');
  
  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: { review },
  });
});

/**
 * @desc    Lấy reviews của 1 sách
 * @route   GET /api/reviews/book/:bookId
 * @access  Public
 */
const getBookReviews = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { page = 1, limit = 10, sortBy = '-createdAt' } = req.query;
  
  const result = await Review.getBookReviews(bookId, {
    page,
    limit,
    sortBy,
  });
  
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Lấy rating statistics của sách
 * @route   GET /api/reviews/book/:bookId/stats
 * @access  Public
 */
const getBookRatingStats = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  
  const stats = await Review.getRatingStats(bookId);
  
  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Cập nhật review
 * @route   PUT /api/reviews/:id
 * @access  Private/Customer (owner)
 */
const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, images } = req.body;
  
  let review = await Review.findById(req.params.id);
  
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }
  
  // Kiểm tra quyền sở hữu
  if (review.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review',
    });
  }
  
  // Update
  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.comment = comment || review.comment;
  if (images) review.images = images;
  
  await review.save();
  await review.populate('customer', 'fullName avatar');
  
  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: { review },
  });
});

/**
 * @desc    Xóa review
 * @route   DELETE /api/reviews/:id
 * @access  Private/Customer (owner)
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }
  
  // Kiểm tra quyền
  if (review.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review',
    });
  }
  
  await review.remove();
  
  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});

/**
 * @desc    Like review
 * @route   PUT /api/reviews/:id/like
 * @access  Private
 */
const likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }
  
  review.likes += 1;
  await review.save();
  
  res.status(200).json({
    success: true,
    message: 'Review liked',
    data: { review },
  });
});

/**
 * @desc    Admin ẩn/hiện review
 * @route   PUT /api/admin/reviews/:id/toggle-visibility
 * @access  Private/Admin
 */
const toggleReviewVisibility = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }
  
  review.isHidden = !review.isHidden;
  await review.save();
  
  res.status(200).json({
    success: true,
    message: `Review ${review.isHidden ? 'hidden' : 'visible'}`,
    data: { review },
  });
});

module.exports = {
  createReview,
  getBookReviews,
  getBookRatingStats,
  updateReview,
  deleteReview,
  likeReview,
  toggleReviewVisibility,
};