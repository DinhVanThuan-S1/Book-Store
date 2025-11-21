/**
 * ==============================================
 * PUBLISHER CONTROLLER
 * ==============================================
 */

const Publisher = require('../models/Publisher');
const Book = require('../models/Book');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy tất cả nhà xuất bản
 * @route   GET /api/publishers
 * @access  Public
 */
const getPublishers = asyncHandler(async (req, res) => {
  // Không filter isActive vì model không có field này
  const publishers = await Publisher.find().sort('name');
  
  // Đếm số sách cho mỗi nhà xuất bản
  const publishersWithCount = await Promise.all(
    publishers.map(async (publisher) => {
      const bookCount = await Book.countDocuments({ publisher: publisher._id });
      return {
        ...publisher.toObject(),
        bookCount,
      };
    })
  );
  
  res.status(200).json({
    success: true,
    data: { publishers: publishersWithCount },
  });
});

/**
 * @desc    Lấy chi tiết NXB
 * @route   GET /api/publishers/:id
 * @access  Public
 */
const getPublisherById = asyncHandler(async (req, res) => {
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
});

/**
 * @desc    Tạo NXB mới (Admin)
 * @route   POST /api/publishers
 * @access  Private/Admin
 */
const createPublisher = asyncHandler(async (req, res) => {
  const { name, address, phone, email, website } = req.body;
  
  const publisher = await Publisher.create({
    name,
    address,
    phone,
    email,
    website,
  });
  
  res.status(201).json({
    success: true,
    message: 'Publisher created successfully',
    data: { publisher },
  });
});

/**
 * @desc    Cập nhật NXB (Admin)
 * @route   PUT /api/publishers/:id
 * @access  Private/Admin
 */
const updatePublisher = asyncHandler(async (req, res) => {
  let publisher = await Publisher.findById(req.params.id);
  
  if (!publisher) {
    return res.status(404).json({
      success: false,
      message: 'Publisher not found',
    });
  }
  
  publisher = await Publisher.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'Publisher updated successfully',
    data: { publisher },
  });
});

/**
 * @desc    Xóa NXB (Admin)
 * @route   DELETE /api/publishers/:id
 * @access  Private/Admin
 */
const deletePublisher = asyncHandler(async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  
  if (!publisher) {
    return res.status(404).json({
      success: false,
      message: 'Publisher not found',
    });
  }
  
  // Kiểm tra xem có sách nào thuộc NXB này không
  const bookCount = await Book.countDocuments({ publisher: req.params.id });
  if (bookCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Không thể xóa nhà xuất bản có ${bookCount} sách`,
    });
  }
  
  await publisher.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Publisher deleted successfully',
  });
});

/**
 * @desc    Lấy danh sách sách theo NXB
 * @route   GET /api/publishers/:id/books
 * @access  Public
 */
const getPublisherBooks = asyncHandler(async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  
  if (!publisher) {
    return res.status(404).json({
      success: false,
      message: 'Publisher not found',
    });
  }
  
  const books = await Book.find({ publisher: req.params.id })
    .select('title images salePrice availableCopies')
    .populate('category', 'name')
    .populate('author', 'name')
    .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    data: { books, publisher },
  });
});

module.exports = {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getPublisherBooks,
};