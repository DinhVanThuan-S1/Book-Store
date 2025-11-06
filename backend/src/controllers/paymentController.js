/**
 * ==============================================
 * PAYMENT CONTROLLER
 * ==============================================
 * Xử lý logic thanh toán
 * Author: DinhVanThuan-S1
 * Date: 2025-11-04
 */

const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Xử lý thanh toán
 * @route   POST /api/payments/:orderId/process
 * @access  Private/Customer
 */
const processPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { paymentMethod } = req.body;
  
  // Tìm order
  const order = await Order.findById(orderId);
  
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
      message: 'Not authorized',
    });
  }
  
  // Tìm hoặc tạo payment
  let payment = await Payment.findOne({ order: orderId });
  
  if (!payment) {
    payment = await Payment.create({
      order: orderId,
      paymentMethod: paymentMethod || order.paymentMethod,
      amount: order.totalPrice,
    });
  }
  
  // Xử lý thanh toán
  const result = await payment.processPayment(paymentMethod || order.paymentMethod);
  
  if (result.success) {
    await payment.save();
    
    // Cập nhật trạng thái order
    order.status = 'confirmed';
    await order.save();
  }
  
  res.status(200).json({
    success: result.success,
    message: result.message,
    data: {
      payment,
      transactionId: result.transactionId,
    },
  });
});

/**
 * @desc    Lấy thông tin payment
 * @route   GET /api/payments/:orderId
 * @access  Private/Customer
 */
const getPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const payment = await Payment.findOne({ order: orderId });
  
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }
  
  // Kiểm tra quyền
  const order = await Order.findById(orderId);
  if (
    req.userRole !== 'admin' &&
    order.customer.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }
  
  res.status(200).json({
    success: true,
    data: { payment },
  });
});

/**
 * @desc    Webhook xử lý kết quả thanh toán
 * @route   POST /api/payments/webhook
 * @access  Public (với signature verification)
 */
const paymentWebhook = asyncHandler(async (req, res) => {
  // TODO: Verify webhook signature
  const { orderId, status, transactionId } = req.body;
  
  const payment = await Payment.findOne({ order: orderId });
  
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }
  
  // Cập nhật trạng thái
  if (status === 'success') {
    payment.status = 'paid';
    payment.transactionId = transactionId;
    payment.paidAt = new Date();
    await payment.save();
    
    // Cập nhật order
    const order = await Order.findById(orderId);
    order.status = 'confirmed';
    await order.save();
  } else {
    payment.status = 'failed';
    await payment.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Webhook processed',
  });
});

/**
 * @desc    Hoàn tiền
 * @route   POST /api/payments/:orderId/refund
 * @access  Private/Admin
 */
const refundPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  
  const payment = await Payment.findOne({ order: orderId });
  
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }
  
  await payment.refund(reason);
  
  res.status(200).json({
    success: true,
    message: 'Payment refunded',
    data: { payment },
  });
});

module.exports = {
  processPayment,
  getPayment,
  paymentWebhook,
  refundPayment,
};