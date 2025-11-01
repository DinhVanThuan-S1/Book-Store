/**
 * ==============================================
 * AUTHOR ROUTES
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const Author = require('../models/Author');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Validation
 */
const authorValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Author name is required'),
];

/**
 * Routes
 */

// @route   GET /api/authors
// @desc    Lấy tất cả tác giả
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const authors = await Author.find().sort('name');
    
    res.status(200).json({
      success: true,
      data: { authors },
    });
  })
);

// @route   GET /api/authors/:id
// @desc    Lấy chi tiết tác giả
// @access  Public
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid author ID'),
  validate,
  asyncHandler(async (req, res) => {
    const author = await Author.findById(req.params.id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: { author },
    });
  })
);

// @route   POST /api/authors
// @desc    Tạo tác giả mới
// @access  Private/Admin
router.post(
  '/',
  protect,
  adminOnly,
  authorValidation,
  validate,
  asyncHandler(async (req, res) => {
    const author = await Author.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Author created successfully',
      data: { author },
    });
  })
);

// @route   PUT /api/authors/:id
// @desc    Cập nhật tác giả
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid author ID'),
  authorValidation,
  validate,
  asyncHandler(async (req, res) => {
    let author = await Author.findById(req.params.id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found',
      });
    }
    
    author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json({
      success: true,
      message: 'Author updated successfully',
      data: { author },
    });
  })
);

// @route   DELETE /api/authors/:id
// @desc    Xóa tác giả
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid author ID'),
  validate,
  asyncHandler(async (req, res) => {
    const author = await Author.findByIdAndDelete(req.params.id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Author deleted successfully',
    });
  })
);

module.exports = router;