/**
 * ==============================================
 * CART MODEL
 * ==============================================
 * Schema cho Cart (Giỏ hàng)
 * Collection: carts
 * Mỗi customer chỉ có 1 cart
 */

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  // Khách hàng (unique - mỗi customer 1 cart)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
    unique: true,
    index: true,
  },
  
  // Danh sách sản phẩm trong giỏ (Embedded)
  items: [
    {
      // Loại: book hoặc combo
      type: {
        type: String,
        enum: ['book', 'combo'],
        required: true,
      },
      
      // ID sách (nếu type = book)
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
      
      // ID combo (nếu type = combo)
      combo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Combo',
      },
      
      // Số lượng
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      
      // Giá (snapshot tại thời điểm thêm vào giỏ)
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      
      // Danh sách bản sao đã reserve
      reservedCopies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BookCopy',
        }
      ],
      
      // Ngày thêm vào giỏ
      addedAt: {
        type: Date,
        default: Date.now,
      },
      
      // Hết hạn reserve (15 phút)
      reservedUntil: {
        type: Date,
      },
    }
  ],
  
  // Tổng tiền (tự động tính)
  totalPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
  collection: 'carts',
});

/**
 * Validation: Item phải có book HOẶC combo (không cả hai)
 */
cartSchema.path('items').validate(function(items) {
  return items.every(item => {
    return (item.book && !item.combo) || (!item.book && item.combo);
  });
}, 'Each item must have either book or combo, not both');

/**
 * Method: Tính tổng tiền giỏ hàng
 */
cartSchema.methods.calculateTotal = function() {
  let total = 0;
  
  this.items.forEach(item => {
    total += item.price * item.quantity;
  });
  
  this.totalPrice = total;
  return total;
};

/**
 * Method: Thêm sách vào giỏ
 * @param {ObjectId} bookId - ID sách
 * @param {Number} quantity - Số lượng
 * @param {Number} price - Giá sách
 */
cartSchema.methods.addBook = async function(bookId, quantity, price) {
  // Kiểm tra sách đã có trong giỏ chưa
  const existingItem = this.items.find(
    item => item.type === 'book' && item.book.toString() === bookId.toString()
  );
  
  if (existingItem) {
    // Tăng số lượng
    existingItem.quantity += quantity;
  } else {
    // Thêm mới
    this.items.push({
      type: 'book',
      book: bookId,
      quantity: quantity,
      price: price,
      addedAt: new Date(),
    });
  }
  
  // Tính lại tổng tiền
  this.calculateTotal();
  
  return await this.save();
};

/**
 * Method: Xóa item khỏi giỏ
 * @param {ObjectId} itemId - ID item trong giỏ
 */
cartSchema.methods.removeItem = async function(itemId) {
  // Tìm và xóa item
  this.items = this.items.filter(
    item => item._id.toString() !== itemId.toString()
  );
  
  // Tính lại tổng tiền
  this.calculateTotal();
  
  return await this.save();
};

/**
 * Method: Cập nhật số lượng item
 * @param {ObjectId} itemId - ID item
 * @param {Number} quantity - Số lượng mới
 */
cartSchema.methods.updateQuantity = async function(itemId, quantity) {
  const item = this.items.find(
    item => item._id.toString() === itemId.toString()
  );
  
  if (item) {
    item.quantity = quantity;
    this.calculateTotal();
    return await this.save();
  }
  
  throw new Error('Item not found in cart');
};

/**
 * Method: Xóa tất cả items (clear cart)
 */
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.totalPrice = 0;
  return await this.save();
};

/**
 * Static Method: Xóa items đã hết hạn reserve
 */
cartSchema.statics.removeExpiredItems = async function() {
  const now = new Date();
  
  // Tìm tất cả carts có items hết hạn
  const carts = await this.find({
    'items.reservedUntil': { $lt: now },
  });
  
  let totalRemoved = 0;
  
  for (const cart of carts) {
    // Lọc bỏ items hết hạn
    const before = cart.items.length;
    cart.items = cart.items.filter(item => {
      return !item.reservedUntil || item.reservedUntil > now;
    });
    const after = cart.items.length;
    
    totalRemoved += (before - after);
    
    // Tính lại total và save
    cart.calculateTotal();
    await cart.save();
  }
  
  console.log(`Removed ${totalRemoved} expired cart items`);
  return totalRemoved;
};

module.exports = mongoose.model('Cart', cartSchema);