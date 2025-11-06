/**
 * ==============================================
 * WISHLIST CONTROLLER
 * ==============================================
 * Xử lý logic danh sách yêu thích
 */

const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy wishlist
 * @route   GET /api/wishlist
 * @access  Private/Customer
 */
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.getOrCreate(req.user._id);
  
  // Populate books
  await wishlist.populate({
    path: 'books.book',
    select: 'title slug images salePrice originalPrice discountPercent averageRating availableCopies',
    populate: { path: 'author', select: 'name' },
  });
  
  res.status(200).json({
    success: true,
    data: { wishlist },
  });
});

/**
 * @desc    Thêm sách vào wishlist
 * @route   POST /api/wishlist/items
 * @access  Private/Customer
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  
  // Kiểm tra sách tồn tại
  const book = await Book.findById(bookId);
  if (!book || !book.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Book not found',
    });
  }
  
  // Lấy hoặc tạo wishlist
  const wishlist = await Wishlist.getOrCreate(req.user._id);
  
  // Thêm sách
  try {
    await wishlist.addBook(bookId);
    
    // Populate
    await wishlist.populate({
      path: 'books.book',
      select: 'title slug images salePrice originalPrice',
    });
    
    res.status(200).json({
      success: true,
      message: 'Book added to wishlist',
      data: { wishlist },
    });
  } catch (error) {
    if (error.message === 'Book already in wishlist') {
      return res.status(400).json({
        success: false,
        message: 'Book already in wishlist',
      });
    }
    throw error;
  }
});

/**
 * @desc    Xóa sách khỏi wishlist
 * @route   DELETE /api/wishlist/items/:bookId
 * @access  Private/Customer
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  
  const wishlist = await Wishlist.findOne({ customer: req.user._id });
  
  if (!wishlist) {
    return res.status(404).json({
      success: false,
      message: 'Wishlist not found',
    });
  }
  
  await wishlist.removeBook(bookId);
  
  await wishlist.populate({
    path: 'books.book',
    select: 'title slug images salePrice originalPrice',
  });
  
  res.status(200).json({
    success: true,
    message: 'Book removed from wishlist',
    data: { wishlist },
  });
});

/**
 * @desc    Chuyển tất cả từ wishlist sang giỏ hàng
 * @route   POST /api/wishlist/move-to-cart
 * @access  Private/Customer
 */
const moveAllToCart = asyncHandler(async (req, res) => {
  const Cart = require('../models/Cart');
  
  const wishlist = await Wishlist.findOne({ customer: req.user._id });
  
  if (!wishlist || wishlist.books.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Wishlist is empty',
    });
  }
  
  // Lấy hoặc tạo cart
  let cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) {
    cart = await Cart.create({
      customer: req.user._id,
      items: [],
    });
  }
  
  // Move all to cart
  const result = await wishlist.moveAllToCart(cart);
  
  res.status(200).json({
    success: true,
    message: `Moved ${result.addedCount} books to cart`,
    data: {
      addedCount: result.addedCount,
      remainingCount: result.remainingCount,
    },
  });
});

/**
 * @desc    Kiểm tra sách có trong wishlist không
 * @route   GET /api/wishlist/check/:bookId
 * @access  Private/Customer
 */
const checkInWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  
  const wishlist = await Wishlist.findOne({ customer: req.user._id });
  
  const inWishlist = wishlist ? wishlist.hasBook(bookId) : false;
  
  res.status(200).json({
    success: true,
    data: { inWishlist },
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveAllToCart,
  checkInWishlist,
};