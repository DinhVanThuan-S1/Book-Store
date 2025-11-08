const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
} = require('../controllers/publisherController');

// Public routes
router.get('/', getPublishers);
router.get('/:id', getPublisherById);

// Admin routes
router.post('/', protect, adminOnly, createPublisher);
router.put('/:id', protect, adminOnly, updatePublisher);
router.delete('/:id', protect, adminOnly, deletePublisher);

module.exports = router;