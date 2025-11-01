/**
 * ==============================================
 * RECOMMENDATION MODEL
 * ==============================================
 * Schema cho Recommendation (Gợi ý sách từ ML)
 * Collection: recommendations
 * Lưu cache kết quả gợi ý từ ML service
 */

const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  // Khách hàng (null = gợi ý chung cho tất cả)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true,
  },
  
  // Loại gợi ý
  recommendationType: {
    type: String,
    enum: [
      'personalized',              // Gợi ý cá nhân hóa
      'similar',                   // Sách tương tự
      'frequently_bought_together',// Mua cùng
      'trending',                  // Đang thịnh hành
      'combo_suggestion',          // Gợi ý combo
    ],
    required: [true, 'Recommendation type is required'],
    index: true,
  },
  
  // Sách gốc (nếu type = similar hoặc frequently_bought_together)
  sourceBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    index: true,
  },
  
  // Danh sách sách được gợi ý (Embedded)
  recommendedBooks: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 1, // Score từ 0-1
      },
      reason: {
        type: String,
        trim: true,
      },
    }
  ],
  
  // Thuật toán sử dụng
  algorithm: {
    type: String,
    enum: ['content_based', 'collaborative', 'hybrid'],
    required: true,
  },
  
  // Ngày tạo gợi ý
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  // Ngày hết hạn (gợi ý tồn tại 7 ngày)
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  
  // Tracking: Số lượt xem
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Tracking: Số lượt click
  clickCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Tracking: Số lượt mua (conversion)
  conversionCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
  collection: 'recommendations',
});

/**
 * Validation: recommendedBooks phải có ít nhất 1 sách
 */
recommendationSchema.path('recommendedBooks').validate(function(books) {
  return books.length >= 1;
}, 'At least one recommended book is required');

/**
 * Middleware: Set expiresAt nếu chưa có (mặc định 7 ngày)
 */
recommendationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    const now = new Date();
    this.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
  }
  next();
});

/**
 * Method: Tracking view
 */
recommendationSchema.methods.trackView = async function() {
  this.viewCount += 1;
  return await this.save();
};

/**
 * Method: Tracking click
 * @param {ObjectId} bookId - ID sách được click
 */
recommendationSchema.methods.trackClick = async function(bookId) {
  this.clickCount += 1;
  
  // TODO: Có thể lưu chi tiết sách nào được click để phân tích
  
  return await this.save();
};

/**
 * Method: Tracking conversion (mua hàng)
 * @param {ObjectId} bookId - ID sách được mua
 */
recommendationSchema.methods.trackConversion = async function(bookId) {
  this.conversionCount += 1;
  return await this.save();
};

/**
 * Method: Tính conversion rate (%)
 * @returns {Number}
 */
recommendationSchema.methods.getConversionRate = function() {
  if (this.clickCount === 0) return 0;
  return (this.conversionCount / this.clickCount) * 100;
};

/**
 * Static Method: Lấy gợi ý còn hiệu lực
 * @param {ObjectId} customerId - ID customer
 * @param {String} type - Loại gợi ý
 * @param {ObjectId} sourceBookId - ID sách gốc (optional)
 * @returns {Promise<Recommendation|null>}
 */
recommendationSchema.statics.getValidRecommendation = async function(
  customerId,
  type,
  sourceBookId = null
) {
  const query = {
    customer: customerId,
    recommendationType: type,
    expiresAt: { $gt: new Date() },
  };
  
  if (sourceBookId) {
    query.sourceBook = sourceBookId;
  }
  
  return await this.findOne(query)
    .populate('recommendedBooks.book', 'title slug images salePrice originalPrice averageRating');
};

/**
 * Static Method: Xóa gợi ý đã hết hạn
 */
recommendationSchema.statics.removeExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  
  console.log(`Removed ${result.deletedCount} expired recommendations`);
  return result;
};

/**
 * Static Method: Thống kê hiệu quả gợi ý
 * @param {Date} startDate - Ngày bắt đầu
 * @param {Date} endDate - Ngày kết thúc
 * @returns {Promise<Object>}
 */
recommendationSchema.statics.getPerformanceStats = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        generatedAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$recommendationType',
        totalViews: { $sum: '$viewCount' },
        totalClicks: { $sum: '$clickCount' },
        totalConversions: { $sum: '$conversionCount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        type: '$_id',
        totalViews: 1,
        totalClicks: 1,
        totalConversions: 1,
        count: 1,
        clickRate: {
          $cond: [
            { $eq: ['$totalViews', 0] },
            0,
            { $multiply: [{ $divide: ['$totalClicks', '$totalViews'] }, 100] },
          ],
        },
        conversionRate: {
          $cond: [
            { $eq: ['$totalClicks', 0] },
            0,
            { $multiply: [{ $divide: ['$totalConversions', '$totalClicks'] }, 100] },
          ],
        },
      },
    },
  ]);
  
  return stats;
};

/**
 * Index: Compound indexes
 */
recommendationSchema.index({ customer: 1, recommendationType: 1, expiresAt: 1 });
recommendationSchema.index({ customer: 1, sourceBook: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);