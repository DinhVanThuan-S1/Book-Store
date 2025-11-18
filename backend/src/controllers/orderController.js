/**
 * ==============================================
 * ORDER CONTROLLER
 * ==============================================
 * Xử lý logic đơn hàng
 */

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const BookCopy = require('../models/BookCopy');
const { asyncHandler } = require('../middlewares/errorHandler');
const { paginate } = require('../utils/helper');

/**
 * @desc    Tạo đơn hàng từ giỏ hàng
 * @route   POST /api/orders
 * @access  Private/Customer
 */
const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress, // { recipientName, phone, province, district, ward, detailAddress }
    paymentMethod,   // COD, bank_transfer, momo, credit_card
    notes,
  } = req.body;
  
  // Lấy giỏ hàng
  const cart = await Cart.findOne({ customer: req.user._id })
    .populate({
      path: 'items.book',
      select: 'title salePrice images author',
      populate: {
        path: 'author',
        select: 'name',
      },
    })
    .populate('items.combo', 'name comboPrice image');
  
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty',
    });
  }
  
  // Validate shipping address
  if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.phone) {
    return res.status(400).json({
      success: false,
      message: 'Shipping address is required',
    });
  }
  
  // Tính toán giá
  const subtotal = cart.totalPrice;
  const shippingFee = 25000; // Phí ship cố định (có thể tính theo địa chỉ)
  const discount = 0; // TODO: Xử lý coupon
  const totalPrice = subtotal + shippingFee - discount;
  
  // Tạo items cho order (bao gồm snapshot)
  const orderItems = [];
  
  for (const item of cart.items) {
    const orderItem = {
      type: item.type,
      quantity: item.quantity,
      price: item.price,
      soldCopies: item.reservedCopies || [],
    };
    
    if (item.type === 'book') {
      orderItem.book = item.book._id;
      orderItem.bookSnapshot = {
        title: item.book.title,
        author: item.book.author ? item.book.author.name : 'Unknown',
        image: item.book.images && item.book.images.length > 0 ? item.book.images[0] : '',
      };
      
      // Cập nhật trạng thái bản sao từ reserved → sold
      if (item.reservedCopies && item.reservedCopies.length > 0) {
        await BookCopy.updateMany(
          { _id: { $in: item.reservedCopies } },
          { status: 'sold', soldDate: new Date() }
        );
      }
    } else if (item.type === 'combo') {
      orderItem.combo = item.combo._id;
      orderItem.comboSnapshot = {
        name: item.combo.name,
        image: item.combo.image || '',
      };
      
      // TODO: Xử lý bản sao cho combo
    }
    
    orderItems.push(orderItem);
  }
  
  // Tạo đơn hàng
  const order = await Order.create({
    customer: req.user._id,
    items: orderItems,
    subtotal,
    shippingFee,
    discount,
    totalPrice,
    shippingAddress,
    notes,
  });
  
  // Tạo payment
  const payment = await Payment.create({
    order: order._id,
    paymentMethod,
    amount: totalPrice,
    status: 'pending',
  });
  
  // Xóa giỏ hàng
  await cart.clearCart();
  
  // Populate để trả về thông tin đầy đủ
  await order.populate('items.book items.combo');
  
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      order,
      payment,
    },
  });
});

/**
 * @desc    Lấy danh sách đơn hàng của customer
 * @route   GET /api/orders
 * @access  Private/Customer
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  // Build query
  const query = { customer: req.user._id };
  if (status) {
    query.status = status;
  }
  
  // Pagination
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const orders = await Order.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);
  
  const total = await Order.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      orders,
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
 * @desc    Lấy chi tiết 1 đơn hàng
 * @route   GET /api/orders/:id
 * @access  Private/Customer
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'fullName email phone')
    .populate('items.book', 'title slug images')
    .populate('items.combo', 'name slug image');
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }
  
  // Kiểm tra quyền: chỉ customer sở hữu hoặc admin mới xem được
  if (
    req.userRole !== 'admin' &&
    order.customer._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }
  
  // Lấy thông tin payment
  const payment = await Payment.findOne({ order: order._id });
  
  res.status(200).json({
    success: true,
    data: {
      order,
      payment,
    },
  });
});

/**
 * @desc    Hủy đơn hàng (chỉ khi status = pending)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private/Customer
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { cancelReason } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }
  
  // Kiểm tra quyền
  if (order.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }
  
  // Chỉ hủy được khi đơn đang pending hoặc confirmed
  if (!['pending', 'confirmed'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel order at this stage',
    });
  }
  
  // Giải phóng bản sao về available
  for (const item of order.items) {
    if (item.soldCopies && item.soldCopies.length > 0) {
      await BookCopy.updateMany(
        { _id: { $in: item.soldCopies } },
        { status: 'available', $unset: { soldDate: 1, order: 1 } }
      );
    }
  }
  
  // Cập nhật trạng thái
  order.status = 'cancelled';
  order.cancelReason = cancelReason;
  await order.save();
  
  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order },
  });
});

/**
 * @desc    Lấy tất cả đơn hàng (Admin)
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  
  // Build query
  const query = {};
  if (status) {
    query.status = status;
  }
  
  // Search theo orderNumber hoặc customer
  if (search) {
    query.$or = [
      { orderNumber: new RegExp(search, 'i') },
      // TODO: Search theo customer name (cần populate)
    ];
  }
  
  // Pagination
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const orders = await Order.find(query)
    .populate('customer', 'fullName email phone')
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);
  
  const total = await Order.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      orders,
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
 * @desc    Cập nhật trạng thái đơn hàng (Admin)
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }
  
  // Validate status transition
  const validStatuses = [
    'pending',
    'confirmed',
    'preparing',
    'shipping',
    'delivered',
    'cancelled',
    'returned',
  ];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
    });
  }
  
  // Cập nhật trạng thái
  await order.updateStatus(status);
  
  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: { order },
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};