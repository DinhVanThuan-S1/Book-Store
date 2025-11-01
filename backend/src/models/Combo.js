/**
 * ==============================================
 * COMBO MODEL
 * ==============================================
 * Schema cho Combo (Bộ sách khuyến mãi)
 * Collection: combos
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const comboSchema = new mongoose.Schema({
  // Tên combo
  name: {
    type: String,
    required: [true, 'Combo name is required'],
    trim: true,
  },
  
  // URL thân thiện
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  
  // Mô tả
  description: {
    type: String,
    trim: true,
  },
  
  // Ảnh combo
  image: {
    type: String,
    default: 'https://via.placeholder.com/400',
  },
  
  // Danh sách sách trong combo (Embedded)
  books: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    }
  ],
  
  // Tổng giá gốc (tự động tính)
  totalOriginalPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Giá combo (giá ưu đãi)
  comboPrice: {
    type: Number,
    required: [true, 'Combo price is required'],
    min: 0,
  },
  
  // % giảm giá (tự động tính)
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // Số tiền tiết kiệm (tự động tính)
  savedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Số combo đã bán
  soldCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Kích hoạt?
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Thời gian hiệu lực
  startDate: {
    type: Date,
  },
  
  endDate: {
    type: Date,
  },
}, {
  timestamps: true,
  collection: 'combos',
});

/**
 * Validation: Combo phải có ít nhất 2 sách
 */
comboSchema.path('books').validate(function(books) {
  return books.length >= 2;
}, 'Combo must have at least 2 books');

/**
 * Middleware: Tạo slug từ name
 */
comboSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

/**
 * Method: Tính tổng giá gốc từ danh sách sách
 * Cần populate books trước khi gọi
 */
comboSchema.methods.calculateTotalOriginalPrice = async function() {
  await this.populate('books.book', 'originalPrice');
  
  let total = 0;
  this.books.forEach(item => {
    if (item.book && item.book.originalPrice) {
      total += item.book.originalPrice * item.quantity;
    }
  });
  
  this.totalOriginalPrice = total;
  
  // Tính % giảm và số tiền tiết kiệm
  if (this.comboPrice && this.totalOriginalPrice > 0) {
    this.savedAmount = this.totalOriginalPrice - this.comboPrice;
    this.discountPercent = Math.round(
      (this.savedAmount / this.totalOriginalPrice) * 100
    );
  }
  
  return total;
};

/**
 * Method: Kiểm tra combo có đủ bản sao để bán không
 * @returns {Promise<Boolean>}
 */
comboSchema.methods.checkAvailability = async function() {
  await this.populate('books.book', 'availableCopies');
  
  for (const item of this.books) {
    if (!item.book || item.book.availableCopies < item.quantity) {
      return false;
    }
  }
  
  return true;
};

/**
 * Method: Tính số lượng combo có thể bán (dựa trên bản sao)
 * @returns {Promise<Number>}
 */
comboSchema.methods.getAvailableQuantity = async function() {
  await this.populate('books.book', 'availableCopies');
  
  let minQuantity = Infinity;
  
  this.books.forEach(item => {
    if (item.book && item.book.availableCopies) {
      const possibleQuantity = Math.floor(
        item.book.availableCopies / item.quantity
      );
      minQuantity = Math.min(minQuantity, possibleQuantity);
    }
  });
  
  return minQuantity === Infinity ? 0 : minQuantity;
};

module.exports = mongoose.model('Combo', comboSchema);