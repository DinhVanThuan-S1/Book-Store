/**
 * ==============================================
 * BOOK CONTROLLER
 * ==============================================
 * Xử lý logic liên quan đến sách
 */

const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const { asyncHandler } = require('../middlewares/errorHandler');
const { paginate } = require('../utils/helper');

/**
 * @desc    Lấy danh sách sách (có filter, sort, paginate)
 * @route   GET /api/books
 * @access  Public
 */
const getBooks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    author,
    publisher,
    minPrice,
    maxPrice,
    search,
    sortBy = '-createdAt', // Mặc định: mới nhất
    includeInactive = false, // Admin có thể xem tất cả
  } = req.query;
  
  // Build query
  const query = {};
  
  // Filter theo isActive (mặc định chỉ lấy active, admin có thể tắt filter này)
  if (includeInactive !== 'true' && includeInactive !== true) {
    query.isActive = true;
  }
  
  // Filter theo category
  if (category) {
    query.category = category;
  }
  
  // Filter theo author
  if (author) {
    query.author = author;
  }
  
  // Filter theo publisher
  if (publisher) {
    query.publisher = publisher;
  }
  
  // Filter theo giá
  if (minPrice || maxPrice) {
    query.salePrice = {};
    if (minPrice) query.salePrice.$gte = Number(minPrice);
    if (maxPrice) query.salePrice.$lte = Number(maxPrice);
  }
  
  // Search theo tên sách hoặc ISBN (partial match, case-insensitive)
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { isbn: searchRegex }
    ];
  }
  
  // Đếm tổng số sách trước (để tránh sai lệch pagination)
  const total = await Book.countDocuments(query);
  
  // Pagination
  const { skip, limit: limitNum } = paginate(page, limit);
  
  // Chuẩn bị sort order - thêm _id để đảm bảo thứ tự ổn định
  let sortOrder = sortBy;
  // Nếu sortBy không chứa _id, thêm _id vào cuối để tránh trùng lặp khi phân trang
  if (!sortBy.includes('_id')) {
    sortOrder = `${sortBy} _id`;
  }
  
  // Execute query
  const books = await Book.find(query)
    .populate('author', 'name')
    .populate('publisher', 'name')
    .populate('category', 'name slug')
    .sort(sortOrder)
    .skip(skip)
    .limit(limitNum);
  
  res.status(200).json({
    success: true,
    data: {
      books,
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
 * @desc    Lấy chi tiết 1 sách
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate('author', 'name bio image')
    .populate('publisher', 'name')
    .populate('category', 'name slug');
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }
  
  // Tăng viewCount
  book.viewCount += 1;
  await book.save();
  
  res.status(200).json({
    success: true,
    data: { book },
  });
});

/**
 * @desc    Lấy sách theo slug
 * @route   GET /api/books/slug/:slug
 * @access  Public
 */
const getBookBySlug = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ slug: req.params.slug, isActive: true })
    .populate('author', 'name bio image')
    .populate('publisher', 'name')
    .populate('category', 'name slug');
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }
  
  // Tăng viewCount
  book.viewCount += 1;
  await book.save();
  
  res.status(200).json({
    success: true,
    data: { book },
  });
});

/**
 * @desc    Tạo sách mới (Admin)
 * @route   POST /api/admin/books
 * @access  Private/Admin
 */
const createBook = asyncHandler(async (req, res) => {
  const {
    title,
    author,
    publisher,
    category,
    isbn,
    publishYear,
    pages,
    bookLanguage,
    format,
    description,
    fullDescription,
    images,
    originalPrice,
    salePrice,
    discountPercent,
  } = req.body;
  
  // Kiểm tra ISBN đã tồn tại chưa
  if (isbn) {
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'ISBN already exists',
      });
    }
  }
  
  // Tạo sách mới
  const book = await Book.create({
    title,
    author,
    publisher,
    category,
    isbn,
    publishYear,
    pages,
    bookLanguage,
    format,
    description,
    fullDescription,
    images,
    originalPrice,
    salePrice,
    discountPercent,
  });
  
  // Populate để trả về thông tin đầy đủ
  await book.populate('author publisher category');
  
  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: { book },
  });
});

/**
 * @desc    Cập nhật sách (Admin)
 * @route   PUT /api/admin/books/:id
 * @access  Private/Admin
 */
const updateBook = asyncHandler(async (req, res) => {
  let book = await Book.findById(req.params.id);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }
  
  // Xử lý giá trước khi update
  const updateData = { ...req.body };
  
  // Nếu có discountPercent, tính salePrice
  if (updateData.discountPercent !== undefined) {
    const originalPrice = updateData.originalPrice || book.originalPrice;
    updateData.salePrice = Math.round(originalPrice - (originalPrice * updateData.discountPercent / 100));
  }
  
  // Update
  book = await Book.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true, // Trả về document sau khi update
      runValidators: true, // Chạy validators
    }
  ).populate('author publisher category');
  
  res.status(200).json({
    success: true,
    message: 'Book updated successfully',
    data: { book },
  });
});

/**
 * @desc    Xóa sách (Admin) - Soft delete
 * @route   DELETE /api/admin/books/:id
 * @access  Private/Admin
 */
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }
  
  // Soft delete: chỉ set isActive = false
  book.isActive = false;
  await book.save();
  
  res.status(200).json({
    success: true,
    message: 'Book deleted successfully',
  });
});

/**
 * @desc    Toggle trạng thái active/inactive của sách
 * @route   PATCH /api/books/:id/toggle-status
 * @access  Private/Admin
 */
const toggleBookStatus = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }
  
  // Toggle isActive
  book.isActive = !book.isActive;
  await book.save();
  
  // Populate để trả về thông tin đầy đủ
  await book.populate('author publisher category');
  
  res.status(200).json({
    success: true,
    message: `Book ${book.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { book },
  });
});

/**
 * @desc    Thêm bản sao sách (Admin)
 * @route   POST /api/admin/books/:id/copies
 * @access  Private/Admin
 */
const addBookCopies = asyncHandler(async (req, res) => {
  const { quantity, importPrice, condition, warehouseLocation } = req.body;
  
  const book = await Book.findById(req.params.id);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }
  
  // Tạo nhiều bản sao
  const copies = [];
  for (let i = 0; i < quantity; i++) {
    const copy = await BookCopy.create({
      book: book._id,
      importPrice,
      condition: condition || 'new',
      warehouseLocation,
    });
    copies.push(copy);
  }
  
  res.status(201).json({
    success: true,
    message: `${quantity} copies added successfully`,
    data: { copies },
  });
});

/**
 * @desc    Lấy danh sách bản sao của 1 sách (Admin)
 * @route   GET /api/admin/books/:id/copies
 * @access  Private/Admin
 */
const getBookCopies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  
  // Build query
  const query = { book: req.params.id };
  if (status) {
    query.status = status;
  }
  
  // Pagination
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const copies = await BookCopy.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);
  
  const total = await BookCopy.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      copies,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

module.exports = {
  getBooks,
  getBookById,
  getBookBySlug,
  createBook,
  updateBook,
  deleteBook,
  toggleBookStatus,
  addBookCopies,
  getBookCopies,
};