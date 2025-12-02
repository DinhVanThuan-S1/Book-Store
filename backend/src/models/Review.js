/**
 * ==============================================
 * REVIEW MODEL
 * ==============================================
 * Schema cho Review (Đánh giá sách)
 * Collection: reviews
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Khách hàng đánh giá
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
    index: true,
  },
  
  // Sách được đánh giá
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required'],
    index: true,
  },
  
  // Đơn hàng liên quan (để verify đã mua)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true,
  },
  
  // Số sao (1-5)
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  
  // Tiêu đề đánh giá (không bắt buộc)
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: '',
  },
  
  // Nội dung đánh giá (không bắt buộc)
  comment: {
    type: String,
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    default: '',
  },
  
  // Ảnh đánh giá (tối đa 5 ảnh)
  images: {
    type: [String],
    validate: [arrayLimit, 'Maximum 5 images allowed'],
  },
  
  // Số lượt like
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Danh sách user đã like (để tracking)
  likedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Customer',
    default: [],
  },
  
  // Đã mua hàng? (verified purchase)
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  // Admin ẩn? (vi phạm nội dung)
  isHidden: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
  collection: 'reviews',
});

/**
 * Validator: Giới hạn số lượng ảnh
 */
function arrayLimit(val) {
  return val.length <= 5;
}

/**
 * Index: Compound index để tránh trùng lặp review
 * Mỗi customer chỉ review 1 lần cho 1 book trong 1 order
 */
reviewSchema.index({ customer: 1, book: 1, order: 1 }, { unique: true });

/**
 * Index: Tìm kiếm nhanh
 */
reviewSchema.index({ book: 1, createdAt: -1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ rating: 1 });

/**
 * Middleware: Cập nhật Book.averageRating và reviewCount sau khi save
 */
reviewSchema.post('save', async function(doc) {
  try {
    await updateBookRating(doc.book);
  } catch (error) {
    console.error('Error updating book rating:', error);
  }
});

/**
 * Middleware: Cập nhật Book.averageRating và reviewCount sau khi xóa
 */
reviewSchema.post('remove', async function(doc) {
  try {
    await updateBookRating(doc.book);
  } catch (error) {
    console.error('Error updating book rating:', error);
  }
});

/**
 * Middleware: Cập nhật Book.averageRating và reviewCount sau khi xóa (deleteOne)
 */
reviewSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  try {
    await updateBookRating(doc.book);
  } catch (error) {
    console.error('Error updating book rating:', error);
  }
});

/**
 * Helper Function: Cập nhật đánh giá trung bình của sách
 * @param {ObjectId} bookId - ID sách
 */
async function updateBookRating(bookId) {
  const Review = mongoose.model('Review');
  const Book = mongoose.model('Book');
  
  // Tính rating trung bình (chỉ tính reviews không bị ẩn)
  const stats = await Review.aggregate([
    {
      $match: {
        book: bookId,
        isHidden: false,
      },
    },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);
  
  if (stats.length > 0) {
    // Làm tròn đến 1 chữ số thập phân
    const avgRating = Math.round(stats[0].averageRating * 10) / 10;
    
    await Book.findByIdAndUpdate(bookId, {
      averageRating: avgRating,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    // Không có review nào
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
}

/**
 * Static Method: Lấy reviews của 1 sách (có phân trang)
 * @param {ObjectId} bookId - ID sách
 * @param {Object} options - { page, limit, sortBy }
 * @returns {Promise<Object>}
 */
reviewSchema.statics.getBookReviews = async function(bookId, options = {}) {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const sortBy = options.sortBy || '-likes'; // Mặc định: likes cao nhất
  
  const skip = (page - 1) * limit;
  
  const reviews = await this.find({
    book: bookId,
    isHidden: false,
  })
  .populate('customer', 'fullName avatar')
  .sort(sortBy)
  .skip(skip)
  .limit(limit);
  
  const total = await this.countDocuments({
    book: bookId,
    isHidden: false,
  });
  
  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Static Method: Thống kê rating của 1 sách
 * @param {ObjectId} bookId - ID sách
 * @returns {Promise<Object>}
 */
reviewSchema.statics.getRatingStats = async function(bookId) {
  // Chuyển đổi bookId thành ObjectId nếu là string
  const mongoose = require('mongoose');
  const bookObjectId = typeof bookId === 'string' ? new mongoose.Types.ObjectId(bookId) : bookId;
  
  const stats = await this.aggregate([
    {
      $match: {
        book: bookObjectId,
        isHidden: false,
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 }, // Sắp xếp từ 5 sao xuống 1 sao
    },
  ]);
  
  // Tạo object với key là số sao
  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };
  
  let total = 0;
  stats.forEach(stat => {
    ratingDistribution[stat._id] = stat.count;
    total += stat.count;
  });
  
  return {
    distribution: ratingDistribution,
    total,
  };
};

module.exports = mongoose.model('Review', reviewSchema);