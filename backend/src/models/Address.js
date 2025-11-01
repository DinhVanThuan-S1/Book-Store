/**
 * ==============================================
 * ADDRESS MODEL
 * ==============================================
 * Schema cho Address (Địa chỉ giao hàng)
 * Collection: addresses
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  // Khách hàng sở hữu địa chỉ này
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
    index: true,
  },
  
  // Tên người nhận
  recipientName: {
    type: String,
    required: [true, 'Recipient name is required'],
    trim: true,
  },
  
  // Số điện thoại người nhận
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Please provide a valid phone number'],
  },
  
  // Tỉnh/Thành phố
  province: {
    type: String,
    required: [true, 'Province is required'],
    trim: true,
  },
  
  // Quận/Huyện
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  
  // Phường/Xã
  ward: {
    type: String,
    required: [true, 'Ward is required'],
    trim: true,
  },
  
  // Số nhà, tên đường
  detailAddress: {
    type: String,
    required: [true, 'Detail address is required'],
    trim: true,
  },
  
  // Loại địa chỉ
  addressType: {
    type: String,
    enum: ['home', 'office', 'other'],
    default: 'home',
  },
  
  // Địa chỉ mặc định?
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'addresses',
});

/**
 * Middleware: Đảm bảo chỉ có 1 địa chỉ mặc định
 * Khi set isDefault = true, các địa chỉ khác của customer này sẽ thành false
 */
addressSchema.pre('save', async function(next) {
  // Chỉ chạy khi isDefault = true
  if (this.isDefault) {
    // Set tất cả địa chỉ khác của customer này thành isDefault = false
    await this.constructor.updateMany(
      { 
        customer: this.customer, 
        _id: { $ne: this._id } // Trừ chính nó
      },
      { isDefault: false }
    );
  }
  next();
});

/**
 * Method: Lấy địa chỉ đầy đủ dạng string
 * @returns {String}
 */
addressSchema.methods.getFullAddress = function() {
  return `${this.detailAddress}, ${this.ward}, ${this.district}, ${this.province}`;
};

/**
 * Index: Tìm kiếm nhanh theo customer
 */
addressSchema.index({ customer: 1, isDefault: -1 });

module.exports = mongoose.model('Address', addressSchema);