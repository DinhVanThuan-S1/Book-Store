/**
 * ==============================================
 * APP ROUTES
 * ==============================================
 * Cấu hình tất cả routes của app
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@components/common/ProtectedRoute';

// Customer Pages
import HomePage from '@pages/customer/HomePage';
import LoginPage from '@pages/customer/LoginPage';
import RegisterPage from '@pages/customer/RegisterPage';
import BookListPage from '@pages/customer/BookListPage';
import BookDetailPage from '@pages/customer/BookDetailPage';
import CartPage from '@pages/customer/CartPage';
// import CheckoutPage from '@pages/customer/CheckoutPage';
// import OrderHistoryPage from '@pages/customer/OrderHistoryPage';
// import OrderDetailPage from '@pages/customer/OrderDetailPage';
// import ProfilePage from '@pages/customer/ProfilePage';

// Admin Pages
// import DashboardPage from '@pages/admin/DashboardPage';
// import BookManagementPage from '@pages/admin/BookManagementPage';

/**
 * AppRoutes Component
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/books" element={<BookListPage />} />
      <Route path="/books/:slug" element={<BookDetailPage />} />

      {/* Protected Routes - Customer */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      /> */}

      {/* Protected Routes - Admin */}
      {/* <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/books"
        element={
          <ProtectedRoute requiredRole="admin">
            <BookManagementPage />
          </ProtectedRoute>
        }
      /> */}

      {/* 404 - Not Found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;