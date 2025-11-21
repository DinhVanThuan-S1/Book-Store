/**
 * ==============================================
 * AUTHOR MODEL
 * ==============================================
 * Schema cho Author (Tác giả)
 * Collection: authors
 */

const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  // Tên tác giả
  name: {
    type: String,
    required: [true, 'Author name is required'],
    unique: true,
    trim: true,
    index: true,
  },
  
  // Tiểu sử
  bio: {
    type: String,
    trim: true,
  },
  
  // Ảnh tác giả
  image: {
    type: String,
    default: 'https://via.placeholder.com/200',
  },
  
  // Quốc tịch
  nationality: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'authors',
});

/**
 * Virtual: Đếm số sách của tác giả này
 * Chỉ dùng khi populate
 */
authorSchema.virtual('bookCount', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'author',
  count: true, // Chỉ đếm số lượng
});

module.exports = mongoose.model('Author', authorSchema);