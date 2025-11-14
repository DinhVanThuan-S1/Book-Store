/**
 * ==============================================
 * BOOKCOPY MODEL
 * ==============================================
 * Schema cho BookCopy (Bản sao sách vật lý)
 * Collection: bookcopies
 * Đây là model QUAN TRỌNG NHẤT của hệ thống
 */

const mongoose = require('mongoose');

const bookCopySchema = new mongoose.Schema({
  // Mã bản sao (auto-generate: COPY-00001)
  copyCode: {
    type: String,
    unique: true,
    // Không bắt buộc vì sẽ tự động tạo trong pre('save') middleware
  },
  
  // Mã vạch/QR code
  barcode: {
    type: String,
    unique: true,
    sparse: true, // Cho phép null
  },
  
  // Sách gốc (Reference đến Book)
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required'],
    index: true,
  },
  
  // Trạng thái bản sao
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'damaged', 'returned'],
    default: 'available',
    index: true,
  },
  
  // Ngày nhập kho
  importDate: {
    type: Date,
    required: [true, 'Import date is required'],
    default: Date.now,
  },
  
  // Giá nhập (để tính lợi nhuận)
  importPrice: {
    type: Number,
    required: [true, 'Import price is required'],
    min: 0,
  },
  
  // Ngày bán
  soldDate: {
    type: Date,
  },
  
  // Đơn hàng (nếu đã bán)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  
  // Vị trí kho
  warehouseLocation: {
    type: String,
    trim: true,
  },
  
  // Tình trạng sách
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good'],
    default: 'new',
  },
  
  // Ghi chú
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'bookcopies',
});

/**
 * Middleware: Auto-generate copyCode trước khi save
 * Format: COPY-00001, COPY-00002, ...
 */
bookCopySchema.pre('save', async function(next) {
  // Chỉ chạy khi tạo mới (không có copyCode)
  if (this.isNew && !this.copyCode) {
    try {
      // Tìm copyCode lớn nhất hiện có
      const lastCopy = await this.constructor
        .findOne()
        .sort({ copyCode: -1 })
        .select('copyCode');
      
      let nextNumber = 1;
      if (lastCopy && lastCopy.copyCode) {
        // Extract số từ "COPY-00001" => 1
        const lastNumber = parseInt(lastCopy.copyCode.split('-')[1]);
        nextNumber = lastNumber + 1;
      }
      
      // Tạo copyCode mới: COPY-00001
      this.copyCode = `COPY-${String(nextNumber).padStart(5, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

/**
 * Middleware: Cập nhật Book.availableCopies khi status thay đổi
 * Chạy sau khi save
 */
bookCopySchema.post('save', async function(doc) {
  try {
    // Đếm số bản sao available của sách này
    const availableCount = await this.constructor.countDocuments({
      book: doc.book,
      status: 'available',
    });
    
    // Đếm số bản sao sold
    const soldCount = await this.constructor.countDocuments({
      book: doc.book,
      status: 'sold',
    });
    
    // Tổng số bản sao
    const totalCount = await this.constructor.countDocuments({
      book: doc.book,
    });
    
    // Cập nhật Book
    const Book = mongoose.model('Book');
    await Book.findByIdAndUpdate(doc.book, {
      availableCopies: availableCount,
      soldCopies: soldCount,
      totalCopies: totalCount,
    });
  } catch (error) {
    console.error('Error updating book copies count:', error);
  }
});

/**
 * Static Method: Tìm bản sao available để bán
 * @param {ObjectId} bookId - ID của sách
 * @param {Number} quantity - Số lượng cần
 * @returns {Promise<Array>} - Danh sách bản sao
 */
bookCopySchema.statics.findAvailableCopies = async function(bookId, quantity) {
  return await this.find({
    book: bookId,
    status: 'available',
  })
  .limit(quantity)
  .select('_id copyCode');
};

/**
 * Static Method: Reserve bản sao (đặt vào giỏ hàng)
 * @param {Array} copyIds - Danh sách ID bản sao
 * @param {Date} reservedUntil - Hết hạn reserve
 */
bookCopySchema.statics.reserveCopies = async function(copyIds, reservedUntil) {
  return await this.updateMany(
    { _id: { $in: copyIds } },
    { 
      status: 'reserved',
      reservedUntil: reservedUntil,
    }
  );
};

/**
 * Static Method: Giải phóng bản sao đã hết hạn reserve
 */
bookCopySchema.statics.releaseExpiredReservations = async function() {
  const now = new Date();
  
  const result = await this.updateMany(
    {
      status: 'reserved',
      reservedUntil: { $lt: now },
    },
    {
      status: 'available',
      $unset: { reservedUntil: 1 },
    }
  );
  
  console.log(`Released ${result.modifiedCount} expired reservations`);
  return result;
};

/**
 * Compound Index: Tìm kiếm nhanh theo book và status
 */
bookCopySchema.index({ book: 1, status: 1 });
bookCopySchema.index({ order: 1 });

module.exports = mongoose.model('BookCopy', bookCopySchema);