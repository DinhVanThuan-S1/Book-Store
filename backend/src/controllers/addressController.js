/**
 * ==============================================
 * ADDRESS CONTROLLER
 * ==============================================
 * Quản lý địa chỉ giao hàng của customer
 * Author: DinhVanThuan-S1
 * Date: 2025-11-04
 */

const Address = require('../models/Address');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy tất cả địa chỉ của customer
 * @route   GET /api/addresses
 * @access  Private/Customer
 */
const getMyAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ customer: req.user._id }).sort(
    '-isDefault -createdAt'
  );
  
  res.status(200).json({
    success: true,
    data: { addresses },
  });
});

/**
 * @desc    Lấy địa chỉ mặc định
 * @route   GET /api/addresses/default
 * @access  Private/Customer
 */
const getDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    customer: req.user._id,
    isDefault: true,
  });
  
  res.status(200).json({
    success: true,
    data: { address },
  });
});

/**
 * @desc    Tạo địa chỉ mới
 * @route   POST /api/addresses
 * @access  Private/Customer
 */
const createAddress = asyncHandler(async (req, res) => {
  const {
    recipientName,
    phone,
    province,
    district,
    ward,
    detailAddress,
    addressType,
    isDefault,
  } = req.body;
  
  const address = await Address.create({
    customer: req.user._id,
    recipientName,
    phone,
    province,
    district,
    ward,
    detailAddress,
    addressType,
    isDefault: isDefault || false,
  });
  
  res.status(201).json({
    success: true,
    message: 'Address created successfully',
    data: { address },
  });
});

/**
 * @desc    Cập nhật địa chỉ
 * @route   PUT /api/addresses/:id
 * @access  Private/Customer
 */
const updateAddress = asyncHandler(async (req, res) => {
  let address = await Address.findById(req.params.id);
  
  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found',
    });
  }
  
  // Kiểm tra quyền
  if (address.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }
  
  // Update
  Object.assign(address, req.body);
  await address.save();
  
  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: { address },
  });
});

/**
 * @desc    Xóa địa chỉ
 * @route   DELETE /api/addresses/:id
 * @access  Private/Customer
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);
  
  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found',
    });
  }
  
  // Kiểm tra quyền
  if (address.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }
  
  await address.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
  });
});

/**
 * @desc    Set địa chỉ mặc định
 * @route   PUT /api/addresses/:id/set-default
 * @access  Private/Customer
 */
const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);
  
  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found',
    });
  }
  
  // Kiểm tra quyền
  if (address.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }
  
  // Set default
  address.isDefault = true;
  await address.save(); // Pre-save middleware sẽ tự động unset các địa chỉ khác
  
  res.status(200).json({
    success: true,
    message: 'Default address updated',
    data: { address },
  });
});

module.exports = {
  getMyAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};