/**
 * ==============================================
 * BOOK MODEL
 * ==============================================
 * Schema cho Book (Sách - Master)
 * Collection: books
 */

const mongoose = require('mongoose');
const slugify = require('slugify'); // npm install slugify

const bookSchema = new mongoose.Schema({
  // Tên sách
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
  },
  
  // URL thân thiện (auto-generate từ title)
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  
  // Tác giả (Reference đến Author)
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required'],
  },
  
  // Nhà xuất bản (Reference đến Publisher)
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher',
    required: [true, 'Publisher is required'],
  },
  
  // Danh mục (Reference đến Category)
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  
  // Mã ISBN (unique)
  isbn: {
    type: String,
    unique: true,
    sparse: true, // Cho phép null
  },
  
  // Năm xuất bản
  publishYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 1,
  },
  
  // Số trang
  pages: {
    type: Number,
    min: 1,
  },
  
  // Ngôn ngữ
  language: {
    type: String,
    enum: ['Vietnamese', 'English', 'Other'],
    default: 'Vietnamese',
  },
  
  // Hình thức
  format: {
    type: String,
    enum: ['hardcover', 'paperback', 'ebook'],
    default: 'paperback',
  },
  
  // Mô tả ngắn
  description: {
    type: String,
    maxlength: 500,
  },
  
  // Mô tả đầy đủ (HTML)
  fullDescription: {
    type: String,
  },
  
  // Danh sách ảnh
  images: {
    type: [String],
    validate: [arrayMinLength, 'At least one image is required'],
  },
  
  // Giá gốc
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: 0,
  },
  
  // Giá bán
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: 0,
  },
  
  // % giảm giá (auto-calculate)
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // Tổng số bản sao
  totalCopies: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Bản sao có sẵn
  availableCopies: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Đã bán
  soldCopies: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Lượt xem
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Lượt mua
  purchaseCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Đánh giá trung bình
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  
  // Số lượng review
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['available', 'out_of_stock', 'discontinued'],
    default: 'available',
  },
  
  // Hiển thị?
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'books',
});

/**
 * Validator: Kiểm tra array có ít nhất 1 phần tử
 */
function arrayMinLength(val) {
  return val.length >= 1;
}

/**
 * Middleware: Tạo slug từ title trước khi save
 */
bookSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

/**
 * Middleware: Tính % giảm giá trước khi save
 */
bookSchema.pre('save', function(next) {
  if (this.originalPrice && this.salePrice) {
    this.discountPercent = Math.round(
      ((this.originalPrice - this.salePrice) / this.originalPrice) * 100
    );
  }
  next();
});

/**
 * Middleware: Cập nhật status dựa trên availableCopies
 */
bookSchema.pre('save', function(next) {
  if (this.availableCopies === 0 && this.status === 'available') {
    this.status = 'out_of_stock';
  } else if (this.availableCopies > 0 && this.status === 'out_of_stock') {
    this.status = 'available';
  }
  next();
});

/**
 * Index cho full-text search
 */
bookSchema.index(
  { title: 'text', description: 'text' },
  { default_language: 'none', language_override: 'textLanguage' }
);

/**
 * Compound indexes
 */
bookSchema.index({ category: 1, status: 1 });
bookSchema.index({ salePrice: 1 });
bookSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Book', bookSchema);