/**
 * ==============================================
 * ORDER MODEL
 * ==============================================
 * Schema cho Order (Đơn hàng)
 * Collection: orders
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Mã đơn hàng (auto-generate: ORD-YYYYMMDD-0001)
  orderNumber: {
    type: String,
    unique: true,
    // Không require vì sẽ được auto-generate trong pre-save middleware
  },
  
  // Khách hàng
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
    index: true,
  },
  
  // Danh sách sản phẩm đã mua (Embedded)
  items: [
    {
      // Loại: book hoặc combo
      type: {
        type: String,
        enum: ['book', 'combo'],
        required: true,
      },
      
      // ID sách/combo
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
      
      combo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Combo',
      },
      
      // Snapshot thông tin sách/combo (lưu lại để không bị ảnh hưởng khi giá thay đổi)
      bookSnapshot: {
        title: String,
        author: String,
        image: String,
      },
      
      comboSnapshot: {
        name: String,
        image: String,
        books: [String], // Danh sách tên sách trong combo
      },
      
      // Số lượng
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      
      // Giá tại thời điểm mua
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      
      // Danh sách bản sao đã bán
      soldCopies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BookCopy',
        }
      ],
    }
  ],
  
  // Tiền hàng
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Phí ship
  shippingFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Giảm giá (coupon)
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Tổng thanh toán
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Địa chỉ giao hàng (Embedded - snapshot từ Address)
  shippingAddress: {
    recipientName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    ward: {
      type: String,
      required: true,
    },
    detailAddress: {
      type: String,
      required: true,
    },
  },
  
  // Trạng thái đơn hàng
  status: {
    type: String,
    enum: [
      'pending',      // Chờ xác nhận
      'confirmed',    // Đã xác nhận
      'preparing',    // Đang chuẩn bị
      'shipping',     // Đang giao
      'delivered',    // Đã giao
      'cancelled',    // Đã hủy
      'returned',     // Hoàn trả
    ],
    default: 'pending',
    index: true,
  },
  
  // Ghi chú
  notes: {
    type: String,
    trim: true,
  },
  
  // Lý do hủy
  cancelReason: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'orders',
});

/**
 * Middleware: Auto-generate orderNumber trước khi save
 * Format: ORD-20251031-0001
 */
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // 20251031
      
      // Tìm order cuối cùng của hôm nay
      const lastOrder = await this.constructor
        .findOne({
          orderNumber: new RegExp(`^ORD-${dateStr}`),
        })
        .sort({ orderNumber: -1 })
        .select('orderNumber');
      
      let nextNumber = 1;
      if (lastOrder && lastOrder.orderNumber) {
        // Extract số từ "ORD-20251031-0001" => 1
        const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
        nextNumber = lastNumber + 1;
      }
      
      // Tạo orderNumber: ORD-20251031-0001
      this.orderNumber = `ORD-${dateStr}-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

/**
 * Method: Lấy địa chỉ giao hàng dạng string
 */
orderSchema.methods.getFullShippingAddress = function() {
  const addr = this.shippingAddress;
  return `${addr.detailAddress}, ${addr.ward}, ${addr.district}, ${addr.province}`;
};

/**
 * Method: Cập nhật trạng thái đơn hàng
 * @param {String} newStatus - Trạng thái mới
 */
orderSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  
  // Nếu trạng thái là delivered, cập nhật Book.purchaseCount
  if (newStatus === 'delivered') {
    for (const item of this.items) {
      if (item.type === 'book' && item.book) {
        const Book = mongoose.model('Book');
        await Book.findByIdAndUpdate(item.book, {
          $inc: { purchaseCount: item.quantity },
        });
      }
    }
  }
  
  return await this.save();
};

/**
 * Index: Tìm kiếm nhanh
 */
orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);