/**
 * ==============================================
 * CART CONTROLLER
 * ==============================================
 * Xử lý logic giỏ hàng
 */

const Cart = require('../models/Cart');
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const Combo = require('../models/Combo');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy giỏ hàng của customer hiện tại
 * @route   GET /api/cart
 * @access  Private/Customer
 */
const getCart = asyncHandler(async (req, res) => {
  // Tìm giỏ hàng, nếu chưa có thì tạo mới
  let cart = await Cart.findOne({ customer: req.user._id })
    .populate({
      path: 'items.book',
      select: 'title slug images salePrice originalPrice availableCopies author',
      populate: {
        path: 'author',
        select: 'name',
      },
    })
    .populate({
      path: 'items.combo',
      select: 'name slug image comboPrice books',
      populate: {
        path: 'books.book',
        select: 'title slug images salePrice',
      },
    });
  
  if (!cart) {
    // Tạo giỏ hàng mới (rỗng)
    cart = await Cart.create({
      customer: req.user._id,
      items: [],
      totalPrice: 0,
    });
  }
  
  res.status(200).json({
    success: true,
    data: { cart },
  });
});

/**
 * @desc    Thêm sách vào giỏ hàng
 * @route   POST /api/cart/items
 * @access  Private/Customer
 */
const addToCart = asyncHandler(async (req, res) => {
  const { type, bookId, comboId, quantity } = req.body;
  
  // Validate type
  if (!['book', 'combo'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid type. Must be "book" or "combo"',
    });
  }
  
  // Tìm hoặc tạo giỏ hàng
  let cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) {
    cart = await Cart.create({
      customer: req.user._id,
      items: [],
    });
  }
  
  // Xử lý thêm sách
  if (type === 'book') {
    const book = await Book.findById(bookId);
    
    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }
    
    // Kiểm tra số lượng bản sao available
    if (book.availableCopies < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${book.availableCopies} copies available`,
      });
    }
    
    // ⚠️ KHÔNG RESERVE khi thêm vào giỏ
    // Chỉ kiểm tra số lượng, reserve sẽ thực hiện khi Order = confirmed
    
    // Kiểm tra sách đã có trong giỏ chưa
    const existingItem = cart.items.find(
      item => item.type === 'book' && item.book.toString() === bookId
    );
    
    if (existingItem) {
      // Tăng số lượng
      existingItem.quantity += quantity;
    } else {
      // Thêm mới (không có reservedCopies)
      cart.items.push({
        type: 'book',
        book: bookId,
        quantity,
        price: book.salePrice,
      });
    }
  }
  
  // Xử lý thêm combo
  if (type === 'combo') {
    const combo = await Combo.findById(comboId);
    
    if (!combo || !combo.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found',
      });
    }
    
    // Kiểm tra combo có đủ bản sao không
    const isAvailable = await combo.checkAvailability();
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Combo is not available',
      });
    }
    
    // ⚠️ KHÔNG RESERVE khi thêm vào giỏ
    // Chỉ kiểm tra số lượng, reserve sẽ thực hiện khi Order = confirmed
    
    // Thêm combo vào giỏ (không có reservedCopies)
    cart.items.push({
      type: 'combo',
      combo: comboId,
      quantity,
      price: combo.comboPrice,
    });
  }
  
  // Tính lại tổng tiền
  cart.calculateTotal();
  await cart.save();
  
  // Populate để trả về thông tin đầy đủ
  await cart.populate('items.book items.combo');
  
  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: { cart },
  });
});

/**
 * @desc    Cập nhật số lượng item trong giỏ
 * @route   PUT /api/cart/items/:itemId
 * @access  Private/Customer
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  
  const cart = await Cart.findOne({ customer: req.user._id });
  
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found',
    });
  }
  
  // Tìm item
  const item = cart.items.id(req.params.itemId);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart',
    });
  }
  
  // Validate số lượng mới
  if (quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1',
    });
  }
  
  // TODO: Kiểm tra số lượng bản sao available nếu tăng số lượng
  
  // Cập nhật số lượng
  item.quantity = quantity;
  
  // Tính lại tổng tiền
  cart.calculateTotal();
  await cart.save();
  
  await cart.populate('items.book items.combo');
  
  res.status(200).json({
    success: true,
    message: 'Cart updated',
    data: { cart },
  });
});

/**
 * @desc    Xóa item khỏi giỏ hàng
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private/Customer
 */
const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.user._id });
  
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found',
    });
  }
  
  // Tìm item
  const item = cart.items.id(req.params.itemId);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart',
    });
  }
  
  // ⚠️ KHÔNG CẦN giải phóng bản sao vì không reserve khi thêm vào giỏ
  
  // Xóa item (sử dụng pull thay vì remove)
  cart.items.pull(req.params.itemId);
  
  // Tính lại tổng tiền
  cart.calculateTotal();
  await cart.save();
  
  await cart.populate('items.book items.combo');
  
  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: { cart },
  });
});

/**
 * @desc    Xóa tất cả items trong giỏ
 * @route   DELETE /api/cart/clear
 * @access  Private/Customer
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.user._id });
  
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found',
    });
  }
  
  // ⚠️ KHÔNG CẦN giải phóng bản sao vì không reserve khi thêm vào giỏ
  
  // Xóa tất cả items
  await cart.clearCart();
  
  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    data: { cart },
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};