/**
 * ==============================================
 * APP ROUTES - COMPLETE VERSION
 * ==============================================
 * Tất cả routes của ứng dụng
 * Author: DinhVanThuan-S1
 * Date: 2025-11-04
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@components/common/ProtectedRoute';

// Layout
import AdminLayout from '@components/admin/AdminLayout';

// Customer Pages
import HomePage from '@pages/customer/HomePage';
import LoginPage from '@pages/customer/LoginPage';
import RegisterPage from '@pages/customer/RegisterPage';
import BookListPage from '@pages/customer/BookListPage';
import BookDetailPage from '@pages/customer/BookDetailPage';
import CartPage from '@pages/customer/CartPage';
import CheckoutPage from '@pages/customer/CheckoutPage';
import OrderHistoryPage from '@pages/customer/OrderHistoryPage';
import OrderDetailPage from '@pages/customer/OrderDetailPage';
import ProfilePage from '@pages/customer/ProfilePage';
import WishlistPage from '@pages/customer/WishlistPage';

// Admin Pages
import AdminLoginPage from '@pages/admin/AdminLoginPage';
import DashboardPage from '@pages/admin/DashboardPage';
import BookManagementPage from '@pages/admin/BookManagementPage';

// Other
import NotFoundPage from '@pages/NotFoundPage';

/**
 * AppRoutes Component
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/books" element={<BookListPage />} />
      <Route path="/books/:slug" element={<BookDetailPage />} />

      {/* ==================== CUSTOMER PROTECTED ROUTES ==================== */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute requiredRole="customer">
            <CartPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute requiredRole="customer">
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute requiredRole="customer">
            <OrderHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute requiredRole="customer">
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute requiredRole="customer">
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wishlist"
        element={
          <ProtectedRoute requiredRole="customer">
            <WishlistPage />
          </ProtectedRoute>
        }
      />

      {/* ==================== ADMIN ROUTES ==================== */}
      {/* Admin Login (Public) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Panel (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="books" element={<BookManagementPage />} />
        {/* <Route path="orders" element={<OrderManagementPage />} /> */}
        {/* <Route path="customers" element={<CustomerManagementPage />} /> */}
      </Route>

      {/* ==================== 404 NOT FOUND ==================== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;