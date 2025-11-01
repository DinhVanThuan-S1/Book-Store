/**
 * ==============================================
 * CATEGORY ROUTES
 * ==============================================
 * Định nghĩa các API endpoints cho danh mục
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const Category = require('../models/Category');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Validation Rules
 */

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

/**
 * Public Routes
 */

// @route   GET /api/categories
// @desc    Lấy tất cả danh mục (chỉ active)
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).sort('name');
    
    res.status(200).json({
      success: true,
      data: { categories },
    });
  })
);

// @route   GET /api/categories/:id
// @desc    Lấy chi tiết 1 danh mục
// @access  Public
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid category ID'),
  validate,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: { category },
    });
  })
);

/**
 * Admin Routes
 */

// @route   POST /api/categories
// @desc    Tạo danh mục mới
// @access  Private/Admin
router.post(
  '/',
  protect,
  adminOnly,
  categoryValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { name, description, image } = req.body;
    
    // Kiểm tra tên đã tồn tại chưa
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists',
      });
    }
    
    const category = await Category.create({
      name,
      description,
      image,
    });
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  })
);

// @route   PUT /api/categories/:id
// @desc    Cập nhật danh mục
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid category ID'),
  categoryValidation,
  validate,
  asyncHandler(async (req, res) => {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    
    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  })
);

// @route   DELETE /api/categories/:id
// @desc    Xóa danh mục (soft delete)
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid category ID'),
  validate,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    
    // Soft delete
    category.isActive = false;
    await category.save();
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  })
);

module.exports = router;