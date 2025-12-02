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
  
  // ✅ Lấy danh sách địa chỉ của khách hàng
  const Address = require('../models/Address');
  const addresses = await Address.find({ customer: customer._id }).sort('-isDefault -createdAt');
  
  res.status(200).json({
    success: true,
    data: {
      customer,
      addresses, // ✅ Thêm danh sách địa chỉ
      stats: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
      },
    },
  });
});

/**
 * @desc    Tạo customer mới (Admin)
 * @route   POST /api/admin/customers
 * @access  Private/Admin
 */
const createCustomer = asyncHandler(async (req, res) => {
  const { email, password, fullName, phone, dateOfBirth, gender, avatar } = req.body;
  
  // Kiểm tra email đã tồn tại
  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists',
    });
  }
  
  // Tạo customer mới
  const customer = await Customer.create({
    email,
    password,
    fullName,
    phone,
    dateOfBirth,
    gender,
    avatar,
    isActive: true,
  });
  
  res.status(201).json({
    success: true,
    message: 'Customer created successfully',
    data: { customer },
  });
});

/**
 * @desc    Cập nhật customer (Admin)
 * @route   PUT /api/admin/customers/:id
 * @access  Private/Admin
 */
const updateCustomer = asyncHandler(async (req, res) => {
  const { fullName, phone, dateOfBirth, gender, avatar } = req.body;
  
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found',
    });
  }
  
  // Cập nhật thông tin (không cho phép thay đổi email và password)
  if (fullName) customer.fullName = fullName;
  if (phone) customer.phone = phone;
  if (dateOfBirth) customer.dateOfBirth = dateOfBirth;
  if (gender) customer.gender = gender;
  if (avatar) customer.avatar = avatar;
  
  await customer.save();
  
  res.status(200).json({
    success: true,
    message: 'Customer updated successfully',
    data: { customer },
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

/**
 * @desc    Lấy lịch sử đơn hàng của customer (Admin)
 * @route   GET /api/admin/customers/:id/orders
 * @access  Private/Admin
 */
const getCustomerOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = '-createdAt',
  } = req.query;
  
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found',
    });
  }
  
  const query = { customer: customer._id };
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Pagination
  const { skip, limit: limitNum } = require('../utils/helper').paginate(page, limit);
  
  const orders = await Order.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(limitNum)
    .populate('items.book', 'title images')
    .populate('items.combo', 'name image');
  
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
 * @desc    Lấy lịch sử đánh giá của customer (Admin)
 * @route   GET /api/admin/customers/:id/reviews
 * @access  Private/Admin
 */
const getCustomerReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = '-createdAt',
  } = req.query;
  
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found',
    });
  }
  
  const query = { customer: customer._id };
  
  // Pagination
  const { skip, limit: limitNum } = require('../utils/helper').paginate(page, limit);
  
  const Review = require('../models/Review');
  const reviews = await Review.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(limitNum)
    .populate('book', 'title images slug')
    .populate('order', 'orderNumber');
  
  const total = await Review.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      reviews,
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
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  toggleCustomerActive,
  deleteCustomer,
  getCustomerOrders,
  getCustomerReviews,
};