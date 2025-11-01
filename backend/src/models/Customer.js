/**
 * ==============================================
 * CUSTOMER MODEL
 * ==============================================
 * Schema cho Customer (Khách hàng)
 * Collection: customers
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
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
    select: false,
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
    required: [true, 'Phone number is required'],
    trim: true,
  },
  
  // Ảnh đại diện
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150',
  },
  
  // Ngày sinh
  dateOfBirth: {
    type: Date,
  },
  
  // Giới tính
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  
  // Trạng thái tài khoản
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'customers',
});

/**
 * Middleware: Hash password trước khi save
 */
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Method: So sánh password
 */
customerSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method: Tạo response object
 */
customerSchema.methods.toJSON = function() {
  const customer = this.toObject();
  delete customer.password;
  return customer;
};

module.exports = mongoose.model('Customer', customerSchema);