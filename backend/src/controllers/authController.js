/**
 * ==============================================
 * AUTH CONTROLLER
 * ==============================================
 * Xử lý logic đăng ký, đăng nhập, đổi mật khẩu
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const { generateToken } = require('../utils/jwt');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Đăng ký Customer
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, phone } = req.body;
  
  // Kiểm tra email đã tồn tại chưa
  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists',
    });
  }
  
  // Tạo customer mới
  const customer = await Customer.create({
    email,
    password, // Sẽ được hash tự động bởi pre-save middleware
    fullName,
    phone,
  });
  
  // Generate JWT token
  const token = generateToken({
    id: customer._id,
    role: 'customer',
  });
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      customer: customer.toJSON(), // Không trả về password
      token,
    },
  });
});

/**
 * @desc    Đăng nhập Customer
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Tìm customer (bao gồm password)
  const customer = await Customer.findOne({ email }).select('+password');
  
  if (!customer) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }
  
  // Kiểm tra tài khoản có active không
  if (!customer.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated',
    });
  }
  
  // So sánh password
  const isPasswordMatch = await customer.comparePassword(password);
  
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }
  
  // Generate token
  const token = generateToken({
    id: customer._id,
    role: 'customer',
  });
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      customer: customer.toJSON(),
      token,
    },
  });
});

/**
 * @desc    Đăng nhập Admin
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Tìm admin (bao gồm password)
  const admin = await Admin.findOne({ email }).select('+password');
  
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }
  
  // So sánh password
  const isPasswordMatch = await admin.comparePassword(password);
  
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }
  
  // Generate token
  const token = generateToken({
    id: admin._id,
    role: 'admin',
  });
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      admin: admin.toJSON(),
      token,
    },
  });
});

/**
 * @desc    Lấy thông tin user hiện tại
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user đã được gắn bởi protect middleware
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
      role: req.userRole,
    },
  });
});

/**
 * @desc    Đổi mật khẩu
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Lấy user hiện tại (bao gồm password)
  let user;
  if (req.userRole === 'admin') {
    user = await Admin.findById(req.user._id).select('+password');
  } else {
    user = await Customer.findById(req.user._id).select('+password');
  }
  
  // Kiểm tra password hiện tại
  const isPasswordMatch = await user.comparePassword(currentPassword);
  
  if (!isPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }
  
  // Cập nhật password mới
  user.password = newPassword;
  await user.save(); // Pre-save middleware sẽ hash password
  
  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * @desc    Đăng xuất (Frontend xóa token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // Với JWT, logout chỉ cần frontend xóa token
  // Backend không cần làm gì (stateless)
  
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

module.exports = {
  register,
  loginCustomer,
  loginAdmin,
  getMe,
  changePassword,
  logout,
};