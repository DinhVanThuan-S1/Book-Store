/**
 * ==============================================
 * PUBLISHER MODEL
 * ==============================================
 * Schema cho Publisher (Nhà xuất bản)
 * Collection: publishers
 */

const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  // Tên nhà xuất bản
  name: {
    type: String,
    required: [true, 'Publisher name is required'],
    unique: true,
    trim: true,
    index: true,
  },
  
  // Địa chỉ
  address: {
    type: String,
    trim: true,
  },
  
  // Số điện thoại
  phone: {
    type: String,
    trim: true,
  },
  
  // Email
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  
  // Website
  website: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'publishers',
});

/**
 * Virtual: Đếm số sách của NXB này
 */
publisherSchema.virtual('bookCount', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'publisher',
  count: true,
});

module.exports = mongoose.model('Publisher', publisherSchema);