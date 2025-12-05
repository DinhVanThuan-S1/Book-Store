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
const Book = require('../models/Book');
const Combo = require('../models/Combo');
const { asyncHandler } = require('../middlewares/errorHandler');
const { paginate } = require('../utils/helper');
const { clearRecommendationCacheForCustomer } = require('../services/recommendationService');

/**
 * @desc    Tạo đơn hàng từ giỏ hàng
 * @route   POST /api/orders
 * @access  Private/Customer
 */
const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress, // { recipientName, phone, province, district, ward, detailAddress }
    paymentMethod,   // COD, bank_transfer, momo, zalopay, credit_card
    notes,
    // ✅ Payment details
    bankCode,
    accountNumber,
    accountName,
    momoPhone,
    zaloPhone,
    cardNumber,
    cardName,
    cardExpiry,
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
  const shippingFee = subtotal >= 300000 ? 0 : 25000; // ✅ Miễn phí ship khi >= 300K
  const discount = 0; // TODO: Xử lý coupon
  const totalPrice = subtotal + shippingFee - discount;
  
  // Tạo items cho order (bao gồm snapshot)
  const orderItems = [];
  
  for (const item of cart.items) {
    const orderItem = {
      type: item.type,
      quantity: item.quantity,
      price: item.price,
      soldCopies: [], // Sẽ được gán khi confirmed
    };
    
    if (item.type === 'book') {
      orderItem.book = item.book._id;
      orderItem.bookSnapshot = {
        title: item.book.title,
        author: item.book.author ? item.book.author.name : 'Unknown',
        image: item.book.images && item.book.images.length > 0 ? item.book.images[0] : '',
      };
      
      // ⚠️ Tìm và lưu BookCopy IDs để xử lý sau khi confirmed
      const availableCopies = await BookCopy.find({
        book: item.book._id,
        status: 'available'
      }).limit(item.quantity);
      
      if (availableCopies.length < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough copies available for ${item.book.title}`,
        });
      }
      
      orderItem.soldCopies = availableCopies.map(copy => copy._id);
      
    } else if (item.type === 'combo') {
      orderItem.combo = item.combo._id;
      orderItem.comboSnapshot = {
        name: item.combo.name,
        image: item.combo.image || '',
      };
      
      // ⚠️ Tìm và lưu BookCopy IDs cho combo (sẽ xử lý khi confirmed)
      const combo = await Combo.findById(item.combo._id).populate('books.book');
      if (combo && combo.books) {
        const comboSoldCopies = [];
        for (const bookItem of combo.books) {
          if (bookItem.book) {
            const totalQuantityNeeded = bookItem.quantity * item.quantity;
            const availableCopies = await BookCopy.find({
              book: bookItem.book._id,
              status: 'available'
            }).limit(totalQuantityNeeded);
            
            if (availableCopies.length < totalQuantityNeeded) {
              return res.status(400).json({
                success: false,
                message: `Not enough copies available for ${bookItem.book.title} in combo`,
              });
            }
            
            comboSoldCopies.push(...availableCopies.map(copy => copy._id));
          }
        }
        orderItem.soldCopies = comboSoldCopies;
      }
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
    paymentMethod, // ✅ Lưu paymentMethod vào order
    notes,
  });
  
  // Tạo payment với thông tin thanh toán
  const paymentData = {
    order: order._id,
    paymentMethod,
    amount: totalPrice,
    status: 'pending',
  };

  // ✅ Lưu thông tin thanh toán dựa trên phương thức
  if (paymentMethod === 'bank_transfer') {
    paymentData.bankCode = bankCode;
    paymentData.accountNumber = accountNumber;
    paymentData.accountName = accountName;
    // ✅ Thanh toán online tự động chuyển sang "paid"
    paymentData.status = 'paid';
    paymentData.paidAt = new Date();
  } else if (paymentMethod === 'momo') {
    paymentData.walletPhone = momoPhone;
    // ✅ Thanh toán online tự động chuyển sang "paid"
    paymentData.status = 'paid';
    paymentData.paidAt = new Date();
  } else if (paymentMethod === 'zalopay') {
    paymentData.walletPhone = zaloPhone;
    // ✅ Thanh toán online tự động chuyển sang "paid"
    paymentData.status = 'paid';
    paymentData.paidAt = new Date();
  } else if (paymentMethod === 'credit_card') {
    // Mask số thẻ - chỉ lưu 4 số cuối
    if (cardNumber) {
      const cleaned = cardNumber.replace(/\s/g, '');
      paymentData.cardNumber = '**** **** **** ' + cleaned.slice(-4);
    }
    paymentData.cardName = cardName;
    paymentData.cardExpiry = cardExpiry;
    // ✅ Thanh toán online tự động chuyển sang "paid"
    paymentData.status = 'paid';
    paymentData.paidAt = new Date();
  }
  // COD giữ nguyên status = 'pending'

  const payment = await Payment.create(paymentData);
  
  // Xóa giỏ hàng
  await cart.clearCart();
  
  // 🗑️ Clear recommendation cache để cập nhật gợi ý dựa trên orders mới
  await clearRecommendationCacheForCustomer(req.user._id);
  
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
  
  // Populate payment info cho mỗi order
  const ordersWithPayment = await Promise.all(
    orders.map(async (order) => {
      const payment = await Payment.findOne({ order: order._id }).select('status paymentMethod amount');
      const orderObj = order.toObject();
      return {
        ...orderObj,
        paymentMethod: payment?.paymentMethod,
        payment,
      };
    })
  );
  
  const total = await Order.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      orders: ordersWithPayment,
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
    .populate('items.combo', 'name slug image')
    .populate('items.soldCopies'); // Populate thông tin bản sao
  
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
  
  // Thêm paymentMethod vào order object để frontend dễ truy cập
  const orderData = order.toObject();
  if (payment) {
    orderData.paymentMethod = payment.paymentMethod;
  }
  
  res.status(200).json({
    success: true,
    data: {
      order: orderData,
      payment,
    },
  });
});

/**
 * @desc    Hủy đơn hàng (Customer)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private/Customer
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { cancelReason } = req.body;
  
  const order = await Order.findById(req.params.id).populate('items.book items.combo');
  
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
  
  const oldStatus = order.status;
  
  // ============================================
  // HỦY ĐƠN (từ Customer)
  // ============================================
  
  if (oldStatus === 'pending') {
    // Hủy từ pending: Chỉ giải phóng reserved (nếu có), không cần cập nhật inventory
    for (const item of order.items) {
      if (item.soldCopies && item.soldCopies.length > 0) {
        await BookCopy.updateMany(
          { _id: { $in: item.soldCopies } },
          { 
            status: 'available',
            $unset: { reservedBy: 1, reservedUntil: 1 }
          }
        );
      }
    }
  } else if (oldStatus === 'confirmed') {
    // Hủy từ confirmed: Tăng tồn kho, giảm lượt mua, giải phóng reserved
    for (const item of order.items) {
      if (item.soldCopies && item.soldCopies.length > 0) {
        await BookCopy.updateMany(
          { _id: { $in: item.soldCopies } },
          { 
            status: 'available',
            $unset: { reservedBy: 1, reservedUntil: 1, soldDate: 1 }
          }
        );
      }
      
      if (item.type === 'book' && item.book) {
        // Đồng bộ availableCopies sau khi updateMany
        const availableCount = await BookCopy.countDocuments({
          book: item.book._id,
          status: 'available',
        });
        
        await Book.findByIdAndUpdate(item.book._id, {
          availableCopies: availableCount,
        });
      } else if (item.type === 'combo' && item.combo) {
        // Cập nhật availableCopies cho từng sách trong combo
        const combo = await Combo.findById(item.combo).populate('books.book');
        if (combo && combo.books) {
          for (const bookItem of combo.books) {
            if (bookItem.book) {
              // Đồng bộ availableCopies
              const availableCount = await BookCopy.countDocuments({
                book: bookItem.book._id,
                status: 'available',
              });
              
              await Book.findByIdAndUpdate(bookItem.book._id, {
                availableCopies: availableCount,
              });
            }
          }
        }
        
        // Giảm soldCount của combo
        await Combo.findByIdAndUpdate(item.combo._id, {
          $inc: { soldCount: -item.quantity }
        });
      }
    }
  }
  
  // Hoàn tiền nếu đã thanh toán
  const payment = await Payment.findOne({ order: order._id });
  if (payment && payment.paymentMethod !== 'COD' && payment.status === 'paid') {
    payment.status = 'refunded';
    payment.notes = `Refunded: Order cancelled by customer - ${cancelReason}`;
    await payment.save();
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
  const { page = 1, limit = 20, status, search, sort = '-createdAt' } = req.query;
  
  // Build query
  const query = {};
  if (status) {
    query.status = status;
  }
  
  // ✅ Search theo orderNumber hoặc customer name
  if (search) {
    // Tìm customer có tên khớp
    const Customer = require('../models/Customer');
    const matchingCustomers = await Customer.find({
      fullName: new RegExp(search, 'i')
    }).select('_id');
    
    const customerIds = matchingCustomers.map(c => c._id);
    
    query.$or = [
      { orderNumber: new RegExp(search, 'i') },
      { customer: { $in: customerIds } }
    ];
  }
  
  // Pagination
  const { skip, limit: limitNum } = paginate(page, limit);
  
  // ✅ Sử dụng sort từ query params
  const orders = await Order.find(query)
    .populate('customer', 'fullName email phone')
    .sort(sort) // ✅ Dynamic sort
    .skip(skip)
    .limit(limitNum);
  
  // Populate payment info cho mỗi order
  const Payment = require('../models/Payment');
  const ordersWithPayment = await Promise.all(
    orders.map(async (order) => {
      const payment = await Payment.findOne({ order: order._id }).select('status paymentMethod amount');
      const orderObj = order.toObject();
      return {
        ...orderObj,
        paymentMethod: payment?.paymentMethod,
        payment,
      };
    })
  );
  
  const total = await Order.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      orders: ordersWithPayment,
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
  const { status, cancelReason } = req.body;
  
  const order = await Order.findById(req.params.id).populate('items.book items.combo');
  
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
  
  const oldStatus = order.status;
  
  // ============================================
  // 2️⃣ ĐÃ XÁC NHẬN (confirmed)
  // ============================================
  if (status === 'confirmed' && oldStatus === 'pending') {
    for (const item of order.items) {
      if (item.type === 'book' && item.book) {
        // Chuyển BookCopy: available → reserved
        if (item.soldCopies && item.soldCopies.length > 0) {
          await BookCopy.updateMany(
            { _id: { $in: item.soldCopies } },
            { 
              status: 'reserved',
              reservedBy: order.customer,
              reservedUntil: null // Không hết hạn vì đã confirm
            }
          );
          
          // ⚠️ QUAN TRỌNG: Cập nhật Book.availableCopies sau updateMany
          // Vì middleware post('save') không chạy với updateMany()
          const availableCount = await BookCopy.countDocuments({
            book: item.book._id,
            status: 'available',
          });
          
          await Book.findByIdAndUpdate(item.book._id, {
            availableCopies: availableCount,
          });
        }
        
        // Tăng lượt mua
        await Book.findByIdAndUpdate(item.book._id, {
          $inc: { purchaseCount: item.quantity }
        });
        
      } else if (item.type === 'combo' && item.combo) {
        // Chuyển BookCopy đã có trong soldCopies: available → reserved
        if (item.soldCopies && item.soldCopies.length > 0) {
          await BookCopy.updateMany(
            { _id: { $in: item.soldCopies } },
            { 
              status: 'reserved',
              reservedBy: order.customer,
              reservedUntil: null
            }
          );
        }
        
        // Lấy thông tin combo và cập nhật availableCopies + purchaseCount
        const combo = await Combo.findById(item.combo).populate('books.book');
        if (combo && combo.books) {
          for (const bookItem of combo.books) {
            if (bookItem.book) {
              // ⚠️ Cập nhật Book.availableCopies cho sách trong combo
              const availableCountForBook = await BookCopy.countDocuments({
                book: bookItem.book._id,
                status: 'available',
              });
              
              await Book.findByIdAndUpdate(bookItem.book._id, {
                availableCopies: availableCountForBook,
              });
              
              // Tăng lượt mua cho từng sách trong combo
              const totalQuantityNeeded = bookItem.quantity * item.quantity;
              await Book.findByIdAndUpdate(bookItem.book._id, {
                $inc: { purchaseCount: totalQuantityNeeded }
              });
            }
          }
        }
        
        // Tăng soldCount của combo
        await Combo.findByIdAndUpdate(item.combo._id, {
          $inc: { soldCount: item.quantity }
        });
      }
    }
  }
  
  // ============================================
  // 3️⃣ ĐÃ HỦY (cancelled)
  // ============================================
  if (status === 'cancelled') {
    if (!cancelReason || cancelReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Cancel reason is required and must be at least 10 characters',
      });
    }
    order.cancelReason = cancelReason;
    
    // Nếu hủy từ confirmed trở đi → cần trả lại
    if (['confirmed', 'preparing', 'shipping'].includes(oldStatus)) {
      for (const item of order.items) {
        // Chuyển BookCopy: reserved → available
        if (item.soldCopies && item.soldCopies.length > 0) {
          await BookCopy.updateMany(
            { _id: { $in: item.soldCopies } },
            { 
              status: 'available',
              $unset: { reservedBy: 1, reservedUntil: 1, soldDate: 1 }
            }
          );
          
          // ⚠️ Cập nhật Book.availableCopies
          if (item.type === 'book' && item.book) {
            const availableCount = await BookCopy.countDocuments({
              book: item.book._id,
              status: 'available',
            });
            
            await Book.findByIdAndUpdate(item.book._id, {
              availableCopies: availableCount,
            });
          } else if (item.type === 'combo' && item.combo) {
            // Cập nhật availableCopies cho từng sách trong combo
            const combo = await Combo.findById(item.combo).populate('books.book');
            if (combo && combo.books) {
              for (const bookItem of combo.books) {
                if (bookItem.book) {
                  const availableCount = await BookCopy.countDocuments({
                    book: bookItem.book._id,
                    status: 'available',
                  });
                  
                  await Book.findByIdAndUpdate(bookItem.book._id, {
                    availableCopies: availableCount,
                  });
                }
              }
            }
          }
        }
        
        // Không đổi lượt mua (vì chưa delivered)
        
        if (item.type === 'combo' && item.combo) {
          // Giảm soldCount của combo
          await Combo.findByIdAndUpdate(item.combo._id, {
            $inc: { soldCount: -item.quantity }
          });
        }
      }
    }
    
    // Nếu hủy từ pending → chỉ giải phóng reserved (nếu có)
    if (oldStatus === 'pending') {
      for (const item of order.items) {
        if (item.soldCopies && item.soldCopies.length > 0) {
          await BookCopy.updateMany(
            { _id: { $in: item.soldCopies } },
            { 
              status: 'available',
              $unset: { reservedBy: 1, reservedUntil: 1 }
            }
          );
        }
      }
    }
    
    // Hoàn tiền nếu đã thanh toán
    const payment = await Payment.findOne({ order: order._id });
    if (payment && payment.paymentMethod !== 'COD' && payment.status === 'paid') {
      payment.status = 'refunded';
      payment.notes = `Refunded: Order cancelled - ${cancelReason}`;
      await payment.save();
    }
  }
  
  // ============================================
  // 6️⃣ ĐÃ GIAO (delivered)
  // ============================================
  if (status === 'delivered' && oldStatus !== 'delivered') {
    // Chuyển payment sang paid nếu COD
    const payment = await Payment.findOne({ order: order._id });
    if (payment && payment.paymentMethod === 'COD' && payment.status === 'pending') {
      payment.status = 'paid';
      payment.paidAt = new Date();
      await payment.save();
    }

    // Tăng đã bán, chuyển BookCopy: reserved → sold
    for (const item of order.items) {
      if (item.soldCopies && item.soldCopies.length > 0) {
        await BookCopy.updateMany(
          { _id: { $in: item.soldCopies } },
          { 
            status: 'sold',
            soldDate: new Date(),
            $unset: { reservedBy: 1, reservedUntil: 1 }
          }
        );
        
        // ⚠️ Cập nhật Book.soldCopies
        if (item.type === 'book' && item.book) {
          const soldCount = await BookCopy.countDocuments({
            book: item.book._id,
            status: 'sold',
          });
          
          await Book.findByIdAndUpdate(item.book._id, {
            soldCopies: soldCount,
          });
        }
      }
      
      if (item.type === 'combo' && item.combo) {
        // Tăng soldCopies cho từng sách trong combo
        const combo = await Combo.findById(item.combo).populate('books.book');
        if (combo && combo.books) {
          for (const bookItem of combo.books) {
            if (bookItem.book) {
              const soldCount = await BookCopy.countDocuments({
                book: bookItem.book._id,
                status: 'sold',
              });
              
              await Book.findByIdAndUpdate(bookItem.book._id, {
                soldCopies: soldCount,
              });
            }
          }
        }
      }
    }
  }
  
  // Cập nhật trạng thái đơn hàng
  order.status = status;
  await order.save();
  
  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: { order },
  });
});

/**
 * @desc    Lấy danh sách sách có thể review từ đơn hàng (Customer)
 * @route   GET /api/orders/:id/reviewable-items
 * @access  Private/Customer
 */
const getReviewableItems = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.book', 'title images author')
    .populate({
      path: 'items.book',
      populate: { path: 'author', select: 'name' }
    })
    .populate({
      path: 'items.combo',
      populate: {
        path: 'books.book',
        select: 'title images author',
        populate: { path: 'author', select: 'name' }
      }
    });
  
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
  
  // Chỉ cho phép review khi đã giao
  if (order.status !== 'delivered') {
    return res.status(400).json({
      success: false,
      message: 'Order must be delivered to review',
    });
  }
  
  // Lấy danh sách reviews đã tạo cho order này
  const Review = require('../models/Review');
  const existingReviews = await Review.find({
    order: order._id,
    customer: req.user._id,
  }).select('book');
  
  const reviewedBookIds = existingReviews.map(r => r.book.toString());
  
  // Tạo danh sách sách có thể review (bao gồm sách từ combo)
  const reviewableItems = [];
  
  for (const item of order.items) {
    if (item.type === 'book' && item.book) {
      // Sách đơn lẻ
      reviewableItems.push({
        _id: item._id,
        book: item.book,
        bookSnapshot: item.bookSnapshot,
        quantity: item.quantity,
        isReviewed: reviewedBookIds.includes(item.book._id.toString()),
        fromCombo: false,
      });
    } else if (item.type === 'combo' && item.combo && item.combo.books) {
      // Tách combo thành các sách riêng
      for (const bookItem of item.combo.books) {
        if (bookItem.book) {
          const totalQuantity = bookItem.quantity * item.quantity;
          reviewableItems.push({
            _id: `${item._id}_${bookItem.book._id}`, // Unique ID
            book: bookItem.book,
            bookSnapshot: {
              title: bookItem.book.title,
              author: bookItem.book.author ? bookItem.book.author.name : 'Unknown',
              image: bookItem.book.images && bookItem.book.images.length > 0 ? bookItem.book.images[0] : '',
            },
            quantity: totalQuantity,
            isReviewed: reviewedBookIds.includes(bookItem.book._id.toString()),
            fromCombo: true,
            comboName: item.combo.name,
          });
        }
      }
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      items: reviewableItems,
    },
  });
});

/**
 * @desc    Yêu cầu hoàn trả đơn hàng (Customer)
 * @route   PUT /api/orders/:id/request-return
 * @access  Private/Customer
 */
const requestReturn = asyncHandler(async (req, res) => {
  const { returnReason } = req.body;
  
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
  
  // Chỉ cho phép hoàn trả khi đã giao
  if (order.status !== 'delivered') {
    return res.status(400).json({
      success: false,
      message: 'Can only request return for delivered orders',
    });
  }
  
  // Validate lý do
  if (!returnReason || returnReason.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Return reason is required and must be at least 10 characters',
    });
  }
  
  // ✅ Chỉ đánh dấu yêu cầu hoàn trả, không chuyển status
  order.returnReason = returnReason;
  order.returnRequestedAt = new Date();
  await order.save();
  
  res.status(200).json({
    success: true,
    message: 'Return request submitted successfully. Waiting for admin confirmation.',
    data: { order },
  });
});

/**
 * @desc    Xác nhận hoàn trả đơn hàng (Admin)
 * @route   PUT /api/admin/orders/:id/confirm-return
 * @access  Private/Admin
 */
const confirmReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.book items.combo');
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }
  
  // Kiểm tra phải có yêu cầu hoàn trả
  if (!order.returnRequestedAt) {
    return res.status(400).json({
      success: false,
      message: 'No return request found for this order',
    });
  }
  
  // Kiểm tra status phải là delivered
  if (order.status !== 'delivered') {
    return res.status(400).json({
      success: false,
      message: 'Order must be in delivered status',
    });
  }
  
  // ============================================
  // 7️⃣ HOÀN TRẢ (returned)
  // ============================================
  
  // Tăng tồn kho, giảm đã bán, chuyển BookCopy: sold → available
  for (const item of order.items) {
    if (item.soldCopies && item.soldCopies.length > 0) {
      await BookCopy.updateMany(
        { _id: { $in: item.soldCopies } },
        { 
          status: 'available',
          condition: 'like_new', // Hạ condition
          $unset: { 
            reservedBy: 1,
            reservedUntil: 1,
            soldDate: 1
          }
        }
      );
    }
    
    if (item.type === 'book' && item.book) {
      // Đếm lại soldCopies chính xác
      const soldCount = await BookCopy.countDocuments({
        book: item.book._id,
        status: 'sold',
      });
      
      // Đếm lại availableCopies chính xác
      const availableCount = await BookCopy.countDocuments({
        book: item.book._id,
        status: 'available',
      });
      
      await Book.findByIdAndUpdate(item.book._id, {
        soldCopies: soldCount,
        availableCopies: availableCount,
      });
    } else if (item.type === 'combo' && item.combo) {
      // Cập nhật soldCopies và availableCopies cho từng sách trong combo
      const combo = await Combo.findById(item.combo).populate('books.book');
      if (combo && combo.books) {
        for (const bookItem of combo.books) {
          if (bookItem.book) {
            const soldCount = await BookCopy.countDocuments({
              book: bookItem.book._id,
              status: 'sold',
            });
            
            const availableCount = await BookCopy.countDocuments({
              book: bookItem.book._id,
              status: 'available',
            });
            
            await Book.findByIdAndUpdate(bookItem.book._id, {
              soldCopies: soldCount,
              availableCopies: availableCount,
            });
          }
        }
      }
      
      // Giảm soldCount của combo
      await Combo.findByIdAndUpdate(item.combo._id, {
        $inc: { soldCount: -item.quantity }
      });
    }
  }
  
  // Hoàn tiền
  const payment = await Payment.findOne({ order: order._id });
  if (payment && payment.status === 'paid') {
    payment.status = 'refunded';
    payment.notes = `Refunded: Order returned - ${order.returnReason}`;
    await payment.save();
  }
  
  // Cập nhật status thành returned
  order.status = 'returned';
  await order.save();
  
  res.status(200).json({
    success: true,
    message: 'Return confirmed successfully',
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
  getReviewableItems,
  requestReturn,
  confirmReturn,
};