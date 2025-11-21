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
  const Book = require('../models/Book');
  
  const authors = await Author.find().sort('name');
  
  // Đếm số sách của mỗi tác giả
  const authorsWithCount = await Promise.all(
    authors.map(async (author) => {
      const bookCount = await Book.countDocuments({
        author: author._id,
        isActive: true,
      });
      
      return {
        ...author.toObject(),
        bookCount,
      };
    })
  );
  
  res.status(200).json({
    success: true,
    data: { authors: authorsWithCount },
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
  const { name, bio, image, nationality } = req.body;
  
  console.log('Creating author with data:', { name, bio, image, nationality });
  
  const author = await Author.create({
    name,
    bio,
    image,
    nationality,
  });
  
  console.log('Author created successfully:', author);
  
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
  console.log('Updating author:', req.params.id, 'with data:', req.body);
  
  let author = await Author.findById(req.params.id);
  
  if (!author) {
    console.log('Author not found:', req.params.id);
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
  
  console.log('Author updated successfully:', author);
  
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
  const Book = require('../models/Book');
  
  const author = await Author.findById(req.params.id);
  
  if (!author) {
    return res.status(404).json({
      success: false,
      message: 'Author not found',
    });
  }
  
  // Kiểm tra xem tác giả có sách không
  const bookCount = await Book.countDocuments({
    author: author._id,
    isActive: true,
  });
  
  if (bookCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Không thể xóa tác giả đang có ${bookCount} sách`,
    });
  }
  
  await author.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Author deleted successfully',
  });
});

/**
 * @desc    Lấy danh sách sách của tác giả
 * @route   GET /api/authors/:id/books
 * @access  Public
 */
const getAuthorBooks = asyncHandler(async (req, res) => {
  const Book = require('../models/Book');
  const { page = 1, limit = 20 } = req.query;
  
  const author = await Author.findById(req.params.id);
  
  if (!author) {
    return res.status(404).json({
      success: false,
      message: 'Author not found',
    });
  }
  
  const skip = (page - 1) * limit;
  
  const books = await Book.find({
    author: req.params.id,
    isActive: true,
  })
    .populate('category', 'name')
    .populate('publisher', 'name')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Book.countDocuments({
    author: req.params.id,
    isActive: true,
  });
  
  res.status(200).json({
    success: true,
    data: {
      author,
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
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorBooks,
};