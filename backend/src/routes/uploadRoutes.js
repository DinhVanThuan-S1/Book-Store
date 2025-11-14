/**
 * ==============================================
 * UPLOAD ROUTES
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
  uploadImage,
  uploadImages,
  deleteImage,
} = require('../controllers/uploadController');
const { protect } = require('../middlewares/auth');

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image
 * @access  Private
 */
router.post('/image', protect, upload.single('image'), uploadImage);

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images (max 5)
 * @access  Private
 */
router.post('/images', protect, upload.array('images', 5), uploadImages);

/**
 * @route   DELETE /api/upload/image/:publicId
 * @desc    Delete image from Cloudinary
 * @access  Private
 */
router.delete('/image/:publicId', protect, deleteImage);

module.exports = router;
