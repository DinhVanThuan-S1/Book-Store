/**
 * ==============================================
 * UPLOAD CONTROLLER
 * ==============================================
 * Xử lý upload ảnh lên Cloudinary
 */

const { asyncHandler } = require('../middlewares/errorHandler');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

/**
 * @desc    Upload single image
 * @route   POST /api/upload/image
 * @access  Private
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // Upload buffer to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, 'book-store/books');

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});

/**
 * @desc    Upload multiple images
 * @route   POST /api/upload/images
 * @access  Private
 */
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded',
    });
  }

  // Upload all images to Cloudinary
  const uploadPromises = req.files.map(file => 
    uploadToCloudinary(file.buffer, 'book-store/books')
  );

  const results = await Promise.all(uploadPromises);

  const uploadedImages = results.map(result => ({
    url: result.secure_url,
    publicId: result.public_id,
  }));

  res.status(200).json({
    success: true,
    message: `${uploadedImages.length} images uploaded successfully`,
    data: {
      images: uploadedImages,
    },
  });
});

/**
 * @desc    Delete image from Cloudinary
 * @route   DELETE /api/upload/image/:publicId
 * @access  Private
 */
const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  // Decode publicId (vì URL encode)
  const decodedPublicId = decodeURIComponent(publicId);

  // Delete from Cloudinary
  const result = await cloudinary.uploader.destroy(decodedPublicId);

  if (result.result !== 'ok' && result.result !== 'not found') {
    return res.status(400).json({
      success: false,
      message: 'Failed to delete image',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
  });
});

module.exports = {
  uploadImage,
  uploadImages,
  deleteImage,
};
