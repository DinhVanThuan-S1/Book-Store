/**
 * ==============================================
 * CATEGORY MODEL
 * ==============================================
 * Schema cho Category (Danh mục sách)
 * Collection: categories
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  // Tên danh mục
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    index: true,
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
  
  // Ảnh danh mục
  image: {
    type: String,
    default: 'https://via.placeholder.com/300',
  },
  
  // Kích hoạt?
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'categories',
});

/**
 * Middleware: Tạo slug từ name
 */
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

/**
 * Middleware: Tạo slug từ name khi update
 */
categorySchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
  }
  next();
});

/**
 * Virtual: Đếm số sách trong danh mục
 */
categorySchema.virtual('bookCount', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

module.exports = mongoose.model('Category', categorySchema);