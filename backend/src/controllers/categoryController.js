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
  const Book = require('../models/Book');
  const { includeInactive = false } = req.query;
  
  // Build query
  const query = {};
  
  // Filter theo isActive (mặc định chỉ lấy active, admin có thể tắt filter này)
  if (includeInactive !== 'true' && includeInactive !== true) {
    query.isActive = true;
  }
  
  const categories = await Category.find(query).sort('name');
  
  // Đếm số sách trong mỗi danh mục
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const bookCount = await Book.countDocuments({
        category: category._id,
        isActive: true,
      });
      
      return {
        ...category.toObject(),
        bookCount,
      };
    })
  );
  
  res.status(200).json({
    success: true,
    data: { categories: categoriesWithCount },
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
  
  console.log('Creating category with data:', { name, description, image });
  
  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    console.log('Category already exists:', name);
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
  
  console.log('Category created successfully:', category);
  
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
  console.log('Updating category:', req.params.id, 'with data:', req.body);
  
  let category = await Category.findById(req.params.id);
  
  if (!category) {
    console.log('Category not found:', req.params.id);
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }
  
  // Check duplicate name (nếu đổi tên)
  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      console.log('Category name already exists:', req.body.name);
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
  
  console.log('Category updated successfully:', category);
  
  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: { category },
  });
});

/**
 * @desc    Xóa danh mục (Admin) - Hard delete
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const Book = require('../models/Book');
  
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }
  
  // Kiểm tra xem danh mục có sách không (bao gồm cả sách bị ẩn)
  const bookCount = await Book.countDocuments({
    category: category._id,
  });
  
  if (bookCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Không thể xóa danh mục đang có ${bookCount} sách. Vui lòng xóa hoặc chuyển sách sang danh mục khác trước.`,
    });
  }
  
  // Hard delete: xóa hẳn khỏi database
  await Category.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});

/**
 * @desc    Toggle trạng thái active/inactive của danh mục
 * @route   PATCH /api/categories/:id/toggle-status
 * @access  Private/Admin
 */
const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }
  
  // Toggle isActive
  category.isActive = !category.isActive;
  await category.save();
  
  res.status(200).json({
    success: true,
    message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { category },
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

/**
 * @desc    Lấy danh sách sách theo danh mục
 * @route   GET /api/categories/:id/books
 * @access  Public
 */
const getCategoryBooks = asyncHandler(async (req, res) => {
  const Book = require('../models/Book');
  const { page = 1, limit = 20 } = req.query;
  
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }
  
  const skip = (page - 1) * limit;
  
  const books = await Book.find({
    category: req.params.id,
    isActive: true,
  })
    .populate('author', 'name')
    .populate('publisher', 'name')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Book.countDocuments({
    category: req.params.id,
    isActive: true,
  });
  
  res.status(200).json({
    success: true,
    data: {
      category,
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getCategoryStats,
  getCategoryBooks,
};