/**
 * ==============================================
 * AUTH ROUTES
 * ==============================================
 * Định nghĩa các API endpoints cho authentication
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const {
  register,
  loginCustomer,
  loginAdmin,
  getMe,
  changePassword,
  logout,
  updateProfile,
} = require('../controllers/authController');

/**
 * Validation Rules
 */

// Validation cho đăng ký
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('phone')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Please provide a valid phone number (10-11 digits)'),
];

// Validation cho đăng nhập
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation cho đổi mật khẩu
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
];

// Validation cho update profile
const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Please provide a valid phone number (10-11 digits)'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
];

/**
 * Routes
 */

// @route   POST /api/auth/register
// @desc    Đăng ký customer
// @access  Public
router.post('/register', registerValidation, validate, register);

// @route   POST /api/auth/login
// @desc    Đăng nhập customer
// @access  Public
router.post('/login', loginValidation, validate, loginCustomer);

// @route   POST /api/auth/admin/login
// @desc    Đăng nhập admin
// @access  Public
router.post('/admin/login', loginValidation, validate, loginAdmin);

// @route   GET /api/auth/me
// @desc    Lấy thông tin user hiện tại
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/change-password
// @desc    Đổi mật khẩu
// @access  Private
router.put(
  '/change-password',
  protect,
  changePasswordValidation,
  validate,
  changePassword
);

// @route   POST /api/auth/logout
// @desc    Đăng xuất
// @access  Private
router.post('/logout', protect, logout);

// @route   PUT /api/auth/profile
// @desc    Cập nhật thông tin profile
// @access  Private
router.put(
  '/profile',
  protect,
  updateProfileValidation,
  validate,
  updateProfile
);

module.exports = router;