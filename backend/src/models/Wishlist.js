/**
 * ==============================================
 * WISHLIST MODEL
 * ==============================================
 * Schema cho Wishlist (Danh sách yêu thích)
 * Collection: wishlists
 * Mỗi customer có 1 wishlist
 */

const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  // Khách hàng (unique - mỗi customer 1 wishlist)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
    unique: true,
    index: true,
  },
  
  // Danh sách sách yêu thích (Embedded)
  books: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
}, {
  timestamps: true,
  collection: 'wishlists',
});

/**
 * Method: Thêm sách vào wishlist
 * @param {ObjectId} bookId - ID sách
 */
wishlistSchema.methods.addBook = async function(bookId) {
  // Kiểm tra sách đã có trong wishlist chưa
  const exists = this.books.some(
    item => item.book.toString() === bookId.toString()
  );
  
  if (exists) {
    throw new Error('Book already in wishlist');
  }
  
  // Thêm sách vào wishlist
  this.books.push({
    book: bookId,
    addedAt: new Date(),
  });
  
  return await this.save();
};

/**
 * Method: Xóa sách khỏi wishlist
 * @param {ObjectId} bookId - ID sách
 */
wishlistSchema.methods.removeBook = async function(bookId) {
  this.books = this.books.filter(
    item => item.book.toString() !== bookId.toString()
  );
  
  return await this.save();
};

/**
 * Method: Kiểm tra sách có trong wishlist không
 * @param {ObjectId} bookId - ID sách
 * @returns {Boolean}
 */
wishlistSchema.methods.hasBook = function(bookId) {
  return this.books.some(
    item => item.book.toString() === bookId.toString()
  );
};

/**
 * Method: Chuyển tất cả sách từ wishlist vào giỏ hàng
 * @param {Object} cart - Cart instance
 */
wishlistSchema.methods.moveAllToCart = async function(cart) {
  // Populate books để lấy giá
  await this.populate('books.book', 'salePrice');
  
  const addedBooks = [];
  
  for (const item of this.books) {
    try {
      await cart.addBook(item.book._id, 1, item.book.salePrice);
      addedBooks.push(item.book._id);
    } catch (error) {
      console.error(`Failed to add book ${item.book._id} to cart:`, error);
    }
  }
  
  // Xóa các sách đã thêm vào giỏ khỏi wishlist
  this.books = this.books.filter(
    item => !addedBooks.includes(item.book._id.toString())
  );
  
  await this.save();
  
  return {
    addedCount: addedBooks.length,
    remainingCount: this.books.length,
  };
};

/**
 * Static Method: Lấy wishlist của customer (tạo mới nếu chưa có)
 * @param {ObjectId} customerId - ID customer
 * @returns {Promise<Wishlist>}
 */
wishlistSchema.statics.getOrCreate = async function(customerId) {
  let wishlist = await this.findOne({ customer: customerId });
  
  if (!wishlist) {
    wishlist = await this.create({
      customer: customerId,
      books: [],
    });
  }
  
  return wishlist;
};

/**
 * Index: Tìm kiếm nhanh
 */
wishlistSchema.index({ 'books.book': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);