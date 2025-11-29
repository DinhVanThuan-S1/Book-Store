/**
 * ==============================================
 * DASHBOARD CONTROLLER
 * ==============================================
 * Thống kê cho admin dashboard
 */

const Book = require('../models/Book');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy thống kê tổng quan
 * @route   GET /api/admin/dashboard/overview
 * @access  Private/Admin
 */
const getOverviewStats = asyncHandler(async (req, res) => {
  // Tổng số sách
  const totalBooks = await Book.countDocuments();
  
  // Tổng số khách hàng
  const totalCustomers = await Customer.countDocuments();
  
  // Tổng số đơn hàng
  const totalOrders = await Order.countDocuments();
  
  // Đơn hàng đang chờ
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  
  // Doanh thu tháng này (chỉ tính đơn đã thanh toán)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const endOfMonth = new Date();
  endOfMonth.setHours(23, 59, 59, 999);
  
  const monthlyRevenueData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $in: ['confirmed', 'preparing', 'shipping', 'delivered'] },
      },
    },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'order',
        as: 'paymentData',
      },
    },
    {
      $unwind: { path: '$paymentData', preserveNullAndEmptyArrays: true },
    },
    {
      $match: {
        'paymentData.status': 'paid',
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$paymentData.amount' },
      },
    },
  ]);
  
  const monthlyRevenue = monthlyRevenueData[0]?.totalRevenue || 0;
  
  res.status(200).json({
    success: true,
    data: {
      totalBooks,
      totalCustomers,
      totalOrders,
      pendingOrders,
      monthlyRevenue,
    },
  });
});

/**
 * @desc    Thống kê doanh thu theo thời gian
 * @route   GET /api/admin/dashboard/revenue
 * @access  Private/Admin
 */
const getRevenueStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);
  
  let groupFormat;
  switch (groupBy) {
    case 'day':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case 'month':
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      break;
    case 'year':
      groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
      break;
    default:
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }
  
  const stats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: ['confirmed', 'preparing', 'shipping', 'delivered'] },
      },
    },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'order',
        as: 'paymentData',
      },
    },
    {
      $unwind: { path: '$paymentData', preserveNullAndEmptyArrays: true },
    },
    {
      $group: {
        _id: groupFormat,
        revenue: { 
          $sum: { 
            $cond: [
              { $eq: ['$paymentData.status', 'paid'] },
              '$paymentData.amount',
              0
            ]
          }
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  
  res.status(200).json({
    success: true,
    data: { stats },
  });
});

/**
 * @desc    Top sách bán chạy
 * @route   GET /api/admin/dashboard/top-books
 * @access  Private/Admin
 */
const getTopBooks = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const topBooks = await Book.find({ isActive: true })
    .sort('-purchaseCount')
    .limit(parseInt(limit))
    .select('title images salePrice purchaseCount soldCopies')
    .populate('author', 'name');
  
  res.status(200).json({
    success: true,
    data: { books: topBooks },
  });
});

/**
 * @desc    Thống kê đơn hàng theo trạng thái
 * @route   GET /api/admin/dashboard/order-stats
 * @access  Private/Admin
 */
const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalPrice' },
      },
    },
  ]);
  
  res.status(200).json({
    success: true,
    data: { stats },
  });
});

/**
 * @desc    Khách hàng mới trong tháng
 * @route   GET /api/admin/dashboard/new-customers
 * @access  Private/Admin
 */
const getNewCustomers = asyncHandler(async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const newCustomers = await Customer.countDocuments({
    createdAt: { $gte: startOfMonth },
  });
  
  res.status(200).json({
    success: true,
    data: { count: newCustomers },
  });
});

/**
 * @desc    Lấy báo cáo chi tiết
 * @route   GET /api/admin/dashboard/reports
 * @access  Private/Admin
 */
const getDetailedReports = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);
  
  // 1. Tổng doanh thu và đơn hàng
  const payments = await Payment.find({
    status: 'paid',
    paidAt: { $gte: start, $lte: end },
  });
  
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOrders = await Order.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });
  
  // 2. Doanh thu theo ngày (theo ngày tạo đơn, bao gồm cả đơn chưa thanh toán)
  const revenueByDate = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: ['confirmed', 'preparing', 'shipping', 'delivered'] },
      },
    },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'order',
        as: 'paymentData',
      },
    },
    {
      $unwind: { path: '$paymentData', preserveNullAndEmptyArrays: true },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%d/%m', date: '$createdAt' } },
        revenue: { 
          $sum: { 
            $cond: [
              { $eq: ['$paymentData.status', 'paid'] },
              '$paymentData.amount',
              0
            ]
          }
        },
        orders: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        date: '$_id',
        revenue: 1,
        orders: 1,
        _id: 0,
      },
    },
  ]);
  
  // 3. Top sách bán chạy
  const topProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: ['delivered', 'shipping', 'confirmed', 'preparing'] },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $match: {
        'items.type': 'book',
      },
    },
    {
      $group: {
        _id: '$items.book',
        sold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        bookSnapshot: { $first: '$items.bookSnapshot' },
      },
    },
    {
      $sort: { sold: -1 },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'bookData',
      },
    },
    {
      $unwind: { path: '$bookData', preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'bookData.category',
        foreignField: '_id',
        as: 'categoryData',
      },
    },
    {
      $unwind: { path: '$categoryData', preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        name: { $ifNull: ['$bookData.title', '$bookSnapshot.title'] },
        category: { $ifNull: ['$categoryData.name', 'N/A'] },
        sold: 1,
        revenue: 1,
      },
    },
  ]);
  
  // 4. Số sản phẩm đã bán
  const productsSold = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: ['delivered', 'shipping', 'confirmed', 'preparing'] },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$items.quantity' },
      },
    },
  ]);
  
  // 5. Khách hàng mới
  const newCustomers = await Customer.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });
  
  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalRevenue,
        totalOrders,
        productsSold: productsSold[0]?.total || 0,
        newCustomers,
      },
      revenueChart: revenueByDate,
      topProducts: topProducts.map((item, index) => ({
        key: index + 1,
        name: item.name,
        category: item.category,
        sold: item.sold,
        revenue: item.revenue,
      })),
    },
  });
});

module.exports = {
  getOverviewStats,
  getRevenueStats,
  getTopBooks,
  getOrderStats,
  getNewCustomers,
  getDetailedReports,
};