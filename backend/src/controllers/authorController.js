/**
 * ==============================================
 * AUTHOR CONTROLLER
 * ==============================================
 */

const Author = require('../models/Author');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy tất cả tác giả
 * @route   GET /api/authors
 * @access  Public
 */
const getAuthors = asyncHandler(async (req, res) => {
  const authors = await Author.find({ isActive: true }).sort('name');
  
  res.status(200).json({
    success: true,
    data: { authors },
  });
});

/**
 * @desc    Lấy chi tiết tác giả
 * @route   GET /api/authors/:id
 * @access  Public
 */
const getAuthorById = asyncHandler(async (req, res) => {
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
});

/**
 * @desc    Tạo tác giả mới (Admin)
 * @route   POST /api/authors
 * @access  Private/Admin
 */
const createAuthor = asyncHandler(async (req, res) => {
  const { name, bio, image } = req.body;
  
  const author = await Author.create({
    name,
    bio,
    image,
  });
  
  res.status(201).json({
    success: true,
    message: 'Author created successfully',
    data: { author },
  });
});

/**
 * @desc    Cập nhật tác giả (Admin)
 * @route   PUT /api/authors/:id
 * @access  Private/Admin
 */
const updateAuthor = asyncHandler(async (req, res) => {
  let author = await Author.findById(req.params.id);
  
  if (!author) {
    return res.status(404).json({
      success: false,
      message: 'Author not found',
    });
  }
  
  author = await Author.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'Author updated successfully',
    data: { author },
  });
});

/**
 * @desc    Xóa tác giả (Admin)
 * @route   DELETE /api/authors/:id
 * @access  Private/Admin
 */
const deleteAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id);
  
  if (!author) {
    return res.status(404).json({
      success: false,
      message: 'Author not found',
    });
  }
  
  await author.remove();
  
  res.status(200).json({
    success: true,
    message: 'Author deleted successfully',
  });
});

module.exports = {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};