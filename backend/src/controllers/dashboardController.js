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
  
  // Doanh thu tháng này
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const monthlyRevenue = await Payment.getRevenueStats(startOfMonth, new Date());
  
  res.status(200).json({
    success: true,
    data: {
      totalBooks,
      totalCustomers,
      totalOrders,
      pendingOrders,
      monthlyRevenue: monthlyRevenue.totalRevenue,
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
  
  let groupFormat;
  switch (groupBy) {
    case 'day':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } };
      break;
    case 'month':
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$paidAt' } };
      break;
    case 'year':
      groupFormat = { $dateToString: { format: '%Y', date: '$paidAt' } };
      break;
    default:
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } };
  }
  
  const stats = await Payment.aggregate([
    {
      $match: {
        status: 'paid',
        paidAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: groupFormat,
        revenue: { $sum: '$amount' },
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

module.exports = {
  getOverviewStats,
  getRevenueStats,
  getTopBooks,
  getOrderStats,
  getNewCustomers,
};