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
  let { bookId, orderId, rating, title, comment, images } = req.body;
  
  console.log('Received review data:', { bookId, orderId, rating, title, comment, images });
  
  // Convert rating to number if it's string
  rating = Number(rating);
  
  // Validate rating: phải là số nguyên từ 1-5
  if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5',
    });
  }
  
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
  const reviewData = {
    customer: req.user._id,
    book: bookId,
    order: orderId,
    rating,
    title: title || '',
    comment: comment || '',
    images: images || [],
    isVerified: true, // Verified vì đã mua hàng
  };
  
  console.log('Creating review with data:', reviewData);
  
  const review = await Review.create(reviewData);
  
  console.log('Review created:', review);
  
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
 * @desc    Like/Unlike review (toggle)
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
  
  const userId = req.user._id;
  const hasLiked = review.likedBy.includes(userId);
  
  if (hasLiked) {
    // Unlike: Xóa khỏi likedBy và giảm likes
    review.likedBy = review.likedBy.filter(id => id.toString() !== userId.toString());
    review.likes = Math.max(0, review.likes - 1);
  } else {
    // Like: Thêm vào likedBy và tăng likes
    review.likedBy.push(userId);
    review.likes += 1;
  }
  
  await review.save();
  
  res.status(200).json({
    success: true,
    message: hasLiked ? 'Review unliked' : 'Review liked',
    data: { 
      review,
      hasLiked: !hasLiked,
    },
  });
});

/**
 * @desc    Admin ẩn/hiện review
 * @route   PUT /api/reviews/admin/:id/toggle-visibility
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

/**
 * @desc    Lấy tất cả reviews (Admin)
 * @route   GET /api/reviews/admin/all
 * @access  Private/Admin
 */
const getAllReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    rating,
    isVisible,
  } = req.query;
  
  // Build query
  const query = {};
  
  // Filter by rating
  if (rating) {
    query.rating = Number(rating);
  }
  
  // Filter by visibility (isHidden is opposite of isVisible)
  if (isVisible !== undefined && isVisible !== null && isVisible !== '') {
    query.isHidden = isVisible === 'true' ? false : true;
  }
  
  // Search by book title or customer name
  if (search) {
    // Tìm sách có tên khớp
    const matchingBooks = await Book.find({
      title: new RegExp(search, 'i')
    }).select('_id');
    
    const bookIds = matchingBooks.map(b => b._id);
    
    // Tìm khách hàng có tên khớp
    const Customer = require('../models/Customer');
    const matchingCustomers = await Customer.find({
      fullName: new RegExp(search, 'i')
    }).select('_id');
    
    const customerIds = matchingCustomers.map(c => c._id);
    
    query.$or = [
      { book: { $in: bookIds } },
      { customer: { $in: customerIds } }
    ];
  }
  
  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  
  // Fetch reviews
  const reviews = await Review.find(query)
    .populate('customer', 'fullName email avatar')
    .populate({
      path: 'book',
      select: 'title images author',
      populate: {
        path: 'author',
        select: 'name',
      },
    })
    .populate('order', 'orderNumber')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));
  
  // Count total
  const total = await Review.countDocuments(query);
  
  // Transform isHidden to isVisible for frontend
  const transformedReviews = reviews.map(review => {
    const reviewObj = review.toObject();
    reviewObj.isVisible = !reviewObj.isHidden;
    return reviewObj;
  });
  
  res.status(200).json({
    success: true,
    data: {
      reviews: transformedReviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/**
 * @desc    Xóa review (Admin)
 * @route   DELETE /api/reviews/admin/:id
 * @access  Private/Admin
 */
const deleteReviewByAdmin = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }
  
  await review.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
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
  getAllReviews,
  deleteReviewByAdmin,
};