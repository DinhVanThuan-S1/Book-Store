/**
 * ==============================================
 * CUSTOMER CONTROLLER (Admin)
 * ==============================================
 * Quản lý khách hàng cho admin
 */

const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { asyncHandler } = require('../middlewares/errorHandler');
const { paginate } = require('../utils/helper');

/**
 * @desc    Lấy tất cả customers (Admin)
 * @route   GET /api/admin/customers
 * @access  Private/Admin
 */
const getAllCustomers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    isActive,
    sortBy = '-createdAt',
  } = req.query;
  
  const query = {};
  
  // Search
  if (search) {
    query.$or = [
      { fullName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }
  
  // Filter by status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  // Pagination
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const customers = await Customer.find(query)
    .select('-password')
    .sort(sortBy)
    .skip(skip)
    .limit(limitNum);
  
  const total = await Customer.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      customers,
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
 * @desc    Lấy chi tiết customer (Admin)
 * @route   GET /api/admin/customers/:id
 * @access  Private/Admin
 */
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).select('-password');
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found',
    });
  }
  
  // Lấy thống kê đơn hàng
  const totalOrders = await Order.countDocuments({ customer: customer._id });
  const totalSpent = await Order.aggregate([
    {
      $match: {
        customer: customer._id,
        status: 'delivered',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
      },
    },
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      customer,
      stats: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
      },
    },
  });
});

/**
 * @desc    Block/Unblock customer (Admin)
 * @route   PUT /api/admin/customers/:id/toggle-active
 * @access  Private/Admin
 */
const toggleCustomerActive = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found',
    });
  }
  
  customer.isActive = !customer.isActive;
  await customer.save();
  
  res.status(200).json({
    success: true,
    message: `Customer ${customer.isActive ? 'activated' : 'deactivated'}`,
    data: { customer },
  });
});

/**
 * @desc    Xóa customer (Admin)
 * @route   DELETE /api/admin/customers/:id
 * @access  Private/Admin
 */
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found',
    });
  }
  
  // Kiểm tra có đơn hàng không
  const orderCount = await Order.countDocuments({ customer: customer._id });
  
  if (orderCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete customer with existing orders',
    });
  }
  
  await customer.remove();
  
  res.status(200).json({
    success: true,
    message: 'Customer deleted successfully',
  });
});

module.exports = {
  getAllCustomers,
  getCustomerById,
  toggleCustomerActive,
  deleteCustomer,
};