/**
 * ==============================================
 * PAYMENT MODEL
 * ==============================================
 * Schema cho Payment (Thanh toán)
 * Collection: payments
 * Mỗi order có 1 payment
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Đơn hàng (unique - mỗi order 1 payment)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required'],
    unique: true,
    index: true,
  },
  
  // Phương thức thanh toán
  paymentMethod: {
    type: String,
    enum: ['COD', 'bank_transfer', 'momo', 'zalopay', 'credit_card'],
    required: [true, 'Payment method is required'],
    default: 'COD',
  },
  
  // Số tiền thanh toán
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0,
  },
  
  // Trạng thái thanh toán
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  },
  
  // Mã giao dịch (giả lập)
  transactionId: {
    type: String,
    unique: true,
    sparse: true, // Cho phép null
  },
  
  // Mã ngân hàng (nếu bank_transfer)
  bankCode: {
    type: String,
    trim: true,
  },
  
  // Số thẻ (mask - chỉ hiển thị 4 số cuối)
  cardNumber: {
    type: String,
    trim: true,
  },
  
  // Ngày thanh toán thành công
  paidAt: {
    type: Date,
  },
  
  // Ghi chú
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'payments',
});

/**
 * Middleware: Auto-generate transactionId khi status = paid
 */
paymentSchema.pre('save', function(next) {
  // Chỉ chạy khi status thay đổi thành 'paid' và chưa có transactionId
  if (this.isModified('status') && this.status === 'paid' && !this.transactionId) {
    // Generate transactionId: TXN-YYYYMMDDHHMMSS-RANDOM
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 19).replace(/[-:T]/g, ''); // 20251031163000
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionId = `TXN-${dateStr}-${random}`;
    
    // Set paidAt
    if (!this.paidAt) {
      this.paidAt = now;
    }
  }
  next();
});

/**
 * Method: Xử lý thanh toán giả lập
 * @param {String} method - Phương thức thanh toán
 * @returns {Promise<Object>} - Kết quả thanh toán
 */
paymentSchema.methods.processPayment = async function(method) {
  this.paymentMethod = method;
  
  // Giả lập xử lý thanh toán (random success/fail)
  // Trong thực tế, đây là nơi gọi API Payment Gateway
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 90% thành công, 10% thất bại (giả lập)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        this.status = 'paid';
        this.paidAt = new Date();
        
        resolve({
          success: true,
          message: 'Payment successful',
          transactionId: this.transactionId,
        });
      } else {
        this.status = 'failed';
        this.notes = 'Payment failed - Please try again';
        
        resolve({
          success: false,
          message: 'Payment failed',
        });
      }
    }, 2000); // Giả lập delay 2s
  });
};

/**
 * Method: Hoàn tiền (refund)
 * @param {String} reason - Lý do hoàn tiền
 */
paymentSchema.methods.refund = async function(reason) {
  if (this.status !== 'paid') {
    throw new Error('Cannot refund payment that is not paid');
  }
  
  this.status = 'refunded';
  this.notes = `Refunded: ${reason}`;
  
  return await this.save();
};

/**
 * Static Method: Thống kê doanh thu theo thời gian
 * @param {Date} startDate - Ngày bắt đầu
 * @param {Date} endDate - Ngày kết thúc
 * @returns {Promise<Object>}
 */
paymentSchema.statics.getRevenueStats = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        status: 'paid',
        paidAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        avgTransaction: { $avg: '$amount' },
      },
    },
  ]);
  
  return stats[0] || {
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransaction: 0,
  };
};

module.exports = mongoose.model('Payment', paymentSchema);