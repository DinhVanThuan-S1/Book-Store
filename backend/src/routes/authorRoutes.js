const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorBooks,
} = require('../controllers/authorController');

// Public routes
router.get('/', getAuthors);
router.get('/:id/books', getAuthorBooks);
router.get('/:id', getAuthorById);

// Admin routes
router.post('/', protect, adminOnly, createAuthor);
router.put('/:id', protect, adminOnly, updateAuthor);
router.delete('/:id', protect, adminOnly, deleteAuthor);

module.exports = router;