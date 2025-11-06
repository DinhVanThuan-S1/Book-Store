/**
 * ==============================================
 * COMBO CONTROLLER
 * ==============================================
 * Xử lý logic combo/bộ sách
 * Author: DinhVanThuan-S1
 * Date: 2025-11-04
 */

const Combo = require('../models/Combo');
const { asyncHandler } = require('../middlewares/errorHandler');
const { paginate } = require('../utils/helper');

/**
 * @desc    Lấy danh sách combo
 * @route   GET /api/combos
 * @access  Public
 */
const getCombos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, sortBy = '-createdAt' } = req.query;
  
  const query = { isActive: true };
  
  // Pagination
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const combos = await Combo.find(query)
    .populate('books.book', 'title slug images salePrice author')
    .sort(sortBy)
    .skip(skip)
    .limit(limitNum);
  
  const total = await Combo.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      combos,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

/**
 * @desc    Lấy chi tiết combo
 * @route   GET /api/combos/:id
 * @access  Public
 */
const getComboById = asyncHandler(async (req, res) => {
  const combo = await Combo.findById(req.params.id)
    .populate({
      path: 'books.book',
      select: 'title slug images salePrice originalPrice author',
      populate: { path: 'author', select: 'name' },
    });
  
  if (!combo || !combo.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Combo not found',
    });
  }
  
  res.status(200).json({
    success: true,
    data: { combo },
  });
});

/**
 * @desc    Tạo combo mới (Admin)
 * @route   POST /api/admin/combos
 * @access  Private/Admin
 */
const createCombo = asyncHandler(async (req, res) => {
  const { name, description, image, books, comboPrice } = req.body;
  
  // Tạo combo
  const combo = await Combo.create({
    name,
    description,
    image,
    books,
    comboPrice,
  });
  
  // Tính tổng giá gốc
  await combo.calculateTotalOriginalPrice();
  await combo.save();
  
  // Populate
  await combo.populate('books.book', 'title images salePrice');
  
  res.status(201).json({
    success: true,
    message: 'Combo created successfully',
    data: { combo },
  });
});

/**
 * @desc    Cập nhật combo (Admin)
 * @route   PUT /api/admin/combos/:id
 * @access  Private/Admin
 */
const updateCombo = asyncHandler(async (req, res) => {
  let combo = await Combo.findById(req.params.id);
  
  if (!combo) {
    return res.status(404).json({
      success: false,
      message: 'Combo not found',
    });
  }
  
  // Update
  Object.assign(combo, req.body);
  
  // Tính lại giá
  if (req.body.books || req.body.comboPrice) {
    await combo.calculateTotalOriginalPrice();
  }
  
  await combo.save();
  await combo.populate('books.book', 'title images salePrice');
  
  res.status(200).json({
    success: true,
    message: 'Combo updated successfully',
    data: { combo },
  });
});

/**
 * @desc    Xóa combo (Admin)
 * @route   DELETE /api/admin/combos/:id
 * @access  Private/Admin
 */
const deleteCombo = asyncHandler(async (req, res) => {
  const combo = await Combo.findById(req.params.id);
  
  if (!combo) {
    return res.status(404).json({
      success: false,
      message: 'Combo not found',
    });
  }
  
  // Soft delete
  combo.isActive = false;
  await combo.save();
  
  res.status(200).json({
    success: true,
    message: 'Combo deleted successfully',
  });
});

/**
 * @desc    Kiểm tra combo có đủ hàng không
 * @route   GET /api/combos/:id/availability
 * @access  Public
 */
const checkComboAvailability = asyncHandler(async (req, res) => {
  const combo = await Combo.findById(req.params.id);
  
  if (!combo) {
    return res.status(404).json({
      success: false,
      message: 'Combo not found',
    });
  }
  
  const isAvailable = await combo.checkAvailability();
  const availableQuantity = await combo.getAvailableQuantity();
  
  res.status(200).json({
    success: true,
    data: {
      isAvailable,
      availableQuantity,
    },
  });
});

module.exports = {
  getCombos,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo,
  checkComboAvailability,
};