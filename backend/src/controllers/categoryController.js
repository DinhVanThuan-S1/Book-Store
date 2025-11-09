/**
 * ==============================================
 * CATEGORY CONTROLLER
 * ==============================================
 * Xử lý logic danh mục sách
 * Author: DinhVanThuan-S1
 * Date: 2025-11-08
 */

const Category = require('../models/Category');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy tất cả danh mục
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  
  res.status(200).json({
    success: true,
    data: { categories },
  });
});

/**
 * @desc    Lấy chi tiết danh mục
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = asyncHandler(async (req, res) => {
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
});

/**
 * @desc    Lấy danh mục theo slug
 * @route   GET /api/categories/slug/:slug
 * @access  Public
 */
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  
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
});

/**
 * @desc    Tạo danh mục mới (Admin)
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  
  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category already exists',
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
});

/**
 * @desc    Cập nhật danh mục (Admin)
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }
  
  // Check duplicate name (nếu đổi tên)
  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists',
      });
    }
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
});

/**
 * @desc    Xóa danh mục (Admin)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
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
});

/**
 * @desc    Lấy số lượng sách trong mỗi danh mục
 * @route   GET /api/categories/stats
 * @access  Public
 */
const getCategoryStats = asyncHandler(async (req, res) => {
  const Book = require('../models/Book');
  
  const categories = await Category.find({ isActive: true });
  
  const statsPromises = categories.map(async (category) => {
    const bookCount = await Book.countDocuments({
      category: category._id,
      isActive: true,
    });
    
    return {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      bookCount,
    };
  });
  
  const stats = await Promise.all(statsPromises);
  
  res.status(200).json({
    success: true,
    data: { categories: stats },
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
};