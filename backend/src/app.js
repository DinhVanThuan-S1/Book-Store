/**
 * ==============================================
 * MAIN APPLICATION FILE - UPDATED
 * ==============================================
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDatabase = require('./config/database');
const { errorHandler } = require('./middlewares/errorHandler');

// Load env
dotenv.config();

// Init app
const app = express();

// ================================================
// MIDDLEWARES
// ================================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
  });
}

// ================================================
// ROUTES
// ================================================

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running...',
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Online Bookstore API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      books: '/api/books',
      categories: '/api/categories',
      authors: '/api/authors',
      publishers: '/api/publishers',
      cart: '/api/cart',
      orders: '/api/orders',
      reviews: '/api/reviews',
      wishlist: '/api/wishlist',
      dashboard: '/api/admin/dashboard',
    },
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/authors', require('./routes/authorRoutes'));
app.use('/api/publishers', require('./routes/publisherRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin/orders', require('./routes/adminOrderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes')); // ← Upload routes

app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/combos', require('./routes/comboRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/admin/customers', require('./routes/customerRoutes'));
app.use('/api/book-copies', require('./routes/bookCopyRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error Handler
app.use(errorHandler);

// ================================================
// START SERVER
// ================================================

const PORT = process.env.PORT || 5000;
const startAllJobs = require('./jobs');
const startServer = async () => {
  try {
    await connectDatabase();
    // Start background jobs
    startAllJobs();
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📡 API URL: http://localhost:${PORT}`);
      console.log(`📚 Endpoints: http://localhost:${PORT}/`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;