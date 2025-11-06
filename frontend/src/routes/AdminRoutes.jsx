/**
 * ==============================================
 * ADMIN ROUTES
 * ==============================================
 * Routes cho admin panel
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@components/common/ProtectedRoute';
import AdminLayout from '@components/admin/AdminLayout';

// Admin Pages
import DashboardPage from '@pages/admin/DashboardPage';
import BookManagementPage from '@pages/admin/BookManagementPage';
// import OrderManagementPage from '@pages/admin/OrderManagementPage';
// import CustomerManagementPage from '@pages/admin/CustomerManagementPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="books" element={<BookManagementPage />} />
        {/* <Route path="orders" element={<OrderManagementPage />} />
        <Route path="customers" element={<CustomerManagementPage />} /> */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;