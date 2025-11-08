/**
 * ==============================================
 * PUBLISHER CONTROLLER
 * ==============================================
 */

const Publisher = require('../models/Publisher');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy tất cả nhà xuất bản
 * @route   GET /api/publishers
 * @access  Public
 */
const getPublishers = asyncHandler(async (req, res) => {
  const publishers = await Publisher.find({ isActive: true }).sort('name');
  
  res.status(200).json({
    success: true,
    data: { publishers },
  });
});

/**
 * @desc    Lấy chi tiết NXB
 * @route   GET /api/publishers/:id
 * @access  Public
 */
const getPublisherById = asyncHandler(async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  
  if (!publisher) {
    return res.status(404).json({
      success: false,
      message: 'Publisher not found',
    });
  }
  
  res.status(200).json({
    success: true,
    data: { publisher },
  });
});

/**
 * @desc    Tạo NXB mới (Admin)
 * @route   POST /api/publishers
 * @access  Private/Admin
 */
const createPublisher = asyncHandler(async (req, res) => {
  const { name, address, phone, email } = req.body;
  
  const publisher = await Publisher.create({
    name,
    address,
    phone,
    email,
  });
  
  res.status(201).json({
    success: true,
    message: 'Publisher created successfully',
    data: { publisher },
  });
});

/**
 * @desc    Cập nhật NXB (Admin)
 * @route   PUT /api/publishers/:id
 * @access  Private/Admin
 */
const updatePublisher = asyncHandler(async (req, res) => {
  let publisher = await Publisher.findById(req.params.id);
  
  if (!publisher) {
    return res.status(404).json({
      success: false,
      message: 'Publisher not found',
    });
  }
  
  publisher = await Publisher.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'Publisher updated successfully',
    data: { publisher },
  });
});

/**
 * @desc    Xóa NXB (Admin)
 * @route   DELETE /api/publishers/:id
 * @access  Private/Admin
 */
const deletePublisher = asyncHandler(async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  
  if (!publisher) {
    return res.status(404).json({
      success: false,
      message: 'Publisher not found',
    });
  }
  
  await publisher.remove();
  
  res.status(200).json({
    success: true,
    message: 'Publisher deleted successfully',
  });
});

module.exports = {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
};