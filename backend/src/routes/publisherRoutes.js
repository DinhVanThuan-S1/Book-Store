/**
 * ==============================================
 * PUBLISHER ROUTES
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const Publisher = require('../models/Publisher');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Validation
 */
const publisherValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Publisher name is required'),
];

/**
 * Routes (tương tự Author routes)
 */

// GET /api/publishers - Lấy tất cả
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const publishers = await Publisher.find().sort('name');
    
    res.status(200).json({
      success: true,
      data: { publishers },
    });
  })
);

// GET /api/publishers/:id - Chi tiết
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid publisher ID'),
  validate,
  asyncHandler(async (req, res) => {
    const publisher = await Publisher.findById(req.params.id);
    
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Publisher not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: { publisher },
    });
  })
);

// POST /api/publishers - Tạo mới (Admin)
router.post(
  '/',
  protect,
  adminOnly,
  publisherValidation,
  validate,
  asyncHandler(async (req, res) => {
    const publisher = await Publisher.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Publisher created successfully',
      data: { publisher },
    });
  })
);

// PUT /api/publishers/:id - Cập nhật (Admin)
router.put(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid publisher ID'),
  publisherValidation,
  validate,
  asyncHandler(async (req, res) => {
    const publisher = await Publisher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Publisher not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Publisher updated successfully',
      data: { publisher },
    });
  })
);

// DELETE /api/publishers/:id - Xóa (Admin)
router.delete(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid publisher ID'),
  validate,
  asyncHandler(async (req, res) => {
    const publisher = await Publisher.findByIdAndDelete(req.params.id);
    
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Publisher not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Publisher deleted successfully',
    });
  })
);

module.exports = router;