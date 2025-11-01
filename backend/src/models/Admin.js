/**
 * ==============================================
 * ADMIN MODEL
 * ==============================================
 * Schema cho Admin (Quản trị viên)
 * Collection: admins
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // Email đăng nhập (unique)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  
  // Mật khẩu đã hash
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Không trả về password khi query
  },
  
  // Họ tên
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  
  // Số điện thoại
  phone: {
    type: String,
    trim: true,
  },
  
  // Ảnh đại diện
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150',
  },
}, {
  timestamps: true, // Tự động thêm createdAt, updatedAt
  collection: 'admins',
});

/**
 * Middleware: Hash password trước khi save
 * Chỉ hash khi password được thay đổi
 */
adminSchema.pre('save', async function(next) {
  // Nếu password không thay đổi thì bỏ qua
  if (!this.isModified('password')) {
    return next();
  }
  
  // Hash password với bcrypt (salt rounds = 10)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Method: So sánh password khi login
 * @param {String} enteredPassword - Password người dùng nhập
 * @returns {Promise<Boolean>}
 */
adminSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method: Tạo response object (không có password)
 * @returns {Object}
 */
adminSchema.methods.toJSON = function() {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);