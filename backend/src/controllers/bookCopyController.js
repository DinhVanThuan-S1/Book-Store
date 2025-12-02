/**
 * ==============================================
 * BOOK COPY CONTROLLER
 * ==============================================
 * Xử lý logic quản lý bản sao sách (kho)
 * Author: DinhVanThuan-S1
 * Date: 2025-11-28
 */

const BookCopy = require('../models/BookCopy');
const Book = require('../models/Book');
const { asyncHandler } = require('../middlewares/errorHandler');
const { paginate } = require('../utils/helper');

/**
 * @desc    Lấy danh sách tất cả bản sao (Admin)
 * @route   GET /api/book-copies
 * @access  Private/Admin
 */
const getAllBookCopies = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    condition,
    search,
    bookId,
    startDate,
    endDate,
    dateType = 'import', // 'import' hoặc 'sold'
  } = req.query;
  
  // Build query
  const query = {};
  
  // Filter theo status
  if (status) {
    query.status = status;
  }
  
  // Filter theo condition
  if (condition) {
    query.condition = condition;
  }
  
  // Filter theo bookId
  if (bookId) {
    query.book = bookId;
  }
  
  // Search theo copyCode hoặc tên sách
  if (search) {
    // Tìm sách có tên khớp
    const matchingBooks = await Book.find({
      title: new RegExp(search, 'i')
    }).select('_id');
    
    const bookIds = matchingBooks.map(b => b._id);
    
    query.$or = [
      { copyCode: new RegExp(search, 'i') },
      { book: { $in: bookIds } }
    ];
  }
  
  // Filter theo date range
  if (startDate || endDate) {
    const dateField = dateType === 'sold' ? 'soldDate' : 'importDate';
    query[dateField] = {};
    
    if (startDate) {
      query[dateField].$gte = new Date(startDate);
    }
    
    if (endDate) {
      // Thêm 23:59:59 để include cả ngày endDate
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query[dateField].$lte = endDateTime;
    }
  }
  
  // Pagination
  const { skip, limit: limitNum } = paginate(page, limit);
  
  // Execute query
  const bookCopies = await BookCopy.find(query)
    .populate({
      path: 'book',
      select: 'title slug images salePrice',
      populate: {
        path: 'author',
        select: 'name',
      },
    })
    .populate('order', 'orderNumber status')
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);
  
  // Đếm tổng số bản sao
  const total = await BookCopy.countDocuments(query);
  
  // Thống kê theo status
  const stats = await BookCopy.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
  
  // Format stats
  const statsMap = {
    total: total,
    available: 0,
    reserved: 0,
    sold: 0,
    damaged: 0,
    returned: 0,
  };
  
  stats.forEach(stat => {
    if (stat._id && statsMap.hasOwnProperty(stat._id)) {
      statsMap[stat._id] = stat.count;
    }
  });
  
  res.status(200).json({
    success: true,
    data: {
      bookCopies,
      stats: statsMap,
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
 * @desc    Lấy chi tiết 1 bản sao (Admin)
 * @route   GET /api/book-copies/:id
 * @access  Private/Admin
 */
const getBookCopyById = asyncHandler(async (req, res) => {
  const bookCopy = await BookCopy.findById(req.params.id)
    .populate({
      path: 'book',
      select: 'title slug images salePrice author publisher category',
      populate: [
        { path: 'author', select: 'name' },
        { path: 'publisher', select: 'name' },
        { path: 'category', select: 'name' },
      ],
    })
    .populate('order', 'orderNumber status customer createdAt')
    .populate({
      path: 'order',
      populate: {
        path: 'customer',
        select: 'fullName email phone',
      },
    });
  
  if (!bookCopy) {
    return res.status(404).json({
      success: false,
      message: 'Book copy not found',
    });
  }
  
  res.status(200).json({
    success: true,
    data: { bookCopy },
  });
});

/**
 * @desc    Cập nhật trạng thái bản sao (Admin)
 * @route   PUT /api/book-copies/:id
 * @access  Private/Admin
 */
const updateBookCopy = asyncHandler(async (req, res) => {
  const { status, condition, warehouseLocation, notes } = req.body;
  
  const bookCopy = await BookCopy.findById(req.params.id);
  
  if (!bookCopy) {
    return res.status(404).json({
      success: false,
      message: 'Book copy not found',
    });
  }
  
  // Cập nhật các field
  if (status !== undefined) bookCopy.status = status;
  if (condition !== undefined) bookCopy.condition = condition;
  if (warehouseLocation !== undefined) bookCopy.warehouseLocation = warehouseLocation;
  if (notes !== undefined) bookCopy.notes = notes;
  
  await bookCopy.save();
  
  res.status(200).json({
    success: true,
    message: 'Book copy updated successfully',
    data: { bookCopy },
  });
});

/**
 * @desc    Xóa bản sao (Admin)
 * @route   DELETE /api/book-copies/:id
 * @access  Private/Admin
 */
const deleteBookCopy = asyncHandler(async (req, res) => {
  const bookCopy = await BookCopy.findById(req.params.id);
  
  if (!bookCopy) {
    return res.status(404).json({
      success: false,
      message: 'Book copy not found',
    });
  }
  
  // Không cho phép xóa nếu đã bán hoặc đang reserved
  if (['sold', 'reserved'].includes(bookCopy.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete book copy with status: ${bookCopy.status}`,
    });
  }
  
  await bookCopy.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Book copy deleted successfully',
  });
});

/**
 * @desc    Thống kê bản sao theo sách (Admin)
 * @route   GET /api/book-copies/stats/by-book
 * @access  Private/Admin
 */
const getBookCopyStatsByBook = asyncHandler(async (req, res) => {
  const stats = await BookCopy.aggregate([
    {
      $group: {
        _id: '$book',
        total: { $sum: 1 },
        available: {
          $sum: {
            $cond: [{ $eq: ['$status', 'available'] }, 1, 0],
          },
        },
        reserved: {
          $sum: {
            $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0],
          },
        },
        sold: {
          $sum: {
            $cond: [{ $eq: ['$status', 'sold'] }, 1, 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book',
      },
    },
    {
      $unwind: '$book',
    },
    {
      $project: {
        bookId: '$_id',
        bookTitle: '$book.title',
        bookSlug: '$book.slug',
        total: 1,
        available: 1,
        reserved: 1,
        sold: 1,
      },
    },
    {
      $sort: { total: -1 },
    },
    {
      $limit: 50,
    },
  ]);
  
  res.status(200).json({
    success: true,
    data: { stats },
  });
});

/**
 * @desc    Cập nhật trạng thái bản sao (Admin)
 * @route   PUT /api/book-copies/:id/status
 * @access  Private/Admin
 */
const updateBookCopyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['available', 'reserved', 'sold', 'damaged', 'returned'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
    });
  }
  
  const bookCopy = await BookCopy.findById(req.params.id);
  
  if (!bookCopy) {
    return res.status(404).json({
      success: false,
      message: 'Book copy not found',
    });
  }
  
  // Lưu trạng thái cũ
  const oldStatus = bookCopy.status;
  
  // Cập nhật trạng thái
  bookCopy.status = status;
  
  // Nếu chuyển sang sold, thêm soldDate
  if (status === 'sold' && oldStatus !== 'sold') {
    bookCopy.soldDate = new Date();
  }
  
  // Nếu chuyển từ sold về available, xóa soldDate
  if (status === 'available' && oldStatus === 'sold') {
    bookCopy.soldDate = undefined;
  }
  
  await bookCopy.save();
  
  // Populate để trả về thông tin đầy đủ
  await bookCopy.populate({
    path: 'book',
    select: 'title slug images salePrice',
    populate: {
      path: 'author',
      select: 'name',
    },
  });
  
  res.status(200).json({
    success: true,
    message: 'Book copy status updated successfully',
    data: { bookCopy },
  });
});

module.exports = {
  getAllBookCopies,
  getBookCopyById,
  updateBookCopy,
  deleteBookCopy,
  getBookCopyStatsByBook,
  updateBookCopyStatus,
};
