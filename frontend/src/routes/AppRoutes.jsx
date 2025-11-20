/**
 * ==============================================
 * APP ROUTES - COMPLETE WITH LAYOUTS
 * ==============================================
 * Tất cả routes với layout riêng biệt
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@components/common/ProtectedRoute';

// Layouts
import CustomerLayout from '@components/common/CustomerLayout';
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
import OrderManagementPage from '@pages/admin/OrderManagementPage';
import CustomerManagementPage from '@pages/admin/CustomerManagementPage';
import ReportsPage from '@pages/admin/ReportsPage';
import SettingsPage from '@pages/admin/SettingsPage';
import AdminProfilePage from '@pages/admin/AdminProfilePage'; // ⭐ NEW
import CategoryManagementPage from '@pages/admin/CategoryManagementPage'; // ⭐ NEW
import AuthorManagementPage from '@pages/admin/AuthorManagementPage'; // ⭐ NEW
import PublisherManagementPage from '@pages/admin/PublisherManagementPage'; // ⭐ NEW
import ComboManagementPage from '@pages/admin/ComboManagementPage'; // ⭐ NEW
import BookCopyManagementPage from '@pages/admin/BookCopyManagementPage'; // ⭐ NEW
import ReviewManagementPage from '@pages/admin/ReviewManagementPage'; // ⭐ NEW

// Other
import NotFoundPage from '@components/common/NotFoundPage';

/**
 * AppRoutes Component
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* ==================== CUSTOMER ROUTES (WITH LAYOUT) ==================== */}
      <Route element={<CustomerLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/books" element={<BookListPage />} />
        <Route path="/books/:slug" element={<BookDetailPage />} />

        {/* Protected Customer Routes */}
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
      </Route>

      {/* ==================== ADMIN LOGIN (NO LAYOUT) ==================== */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* ==================== ADMIN ROUTES (WITH ADMIN LAYOUT) ==================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<AdminProfilePage />} /> {/* ⭐ NEW */}
        <Route path="books" element={<BookManagementPage />} />
        <Route path="orders" element={<OrderManagementPage />} />
        <Route path="customers" element={<CustomerManagementPage />} />
        <Route path="categories" element={<CategoryManagementPage />} /> {/* ⭐ NEW */}
        <Route path="authors" element={<AuthorManagementPage />} /> {/* ⭐ NEW */}
        <Route path="publishers" element={<PublisherManagementPage />} /> {/* ⭐ NEW */}
        <Route path="combos" element={<ComboManagementPage />} /> {/* ⭐ NEW */}
        <Route path="book-copies" element={<BookCopyManagementPage />} /> {/* ⭐ NEW */}
        <Route path="reviews" element={<ReviewManagementPage />} /> {/* ⭐ NEW */}
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* ==================== 404 NOT FOUND ==================== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;