/**
 * ==============================================
 * PROTECTED ROUTE COMPONENT - UPDATED
 * ==============================================
 * Bảo vệ routes yêu cầu đăng nhập và role
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loading from './Loading';

/**
 * ProtectedRoute Component
 * @param {Object} props
 * @param {React.Component} props.children - Component con
 * @param {String} props.requiredRole - Role yêu cầu ('admin' hoặc 'customer')
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Đang loading
  if (loading) {
    return <Loading fullScreen />;
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    // Nếu là admin route → redirect đến admin login
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Customer route → redirect đến customer login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role (nếu có yêu cầu)
  if (requiredRole) {
    // Xác định role của user hiện tại từ user.role (đã được set khi login)
    const userRole = user?.role || 'customer';

    if (userRole !== requiredRole) {
      // Admin truy cập customer routes → redirect về admin
      if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      }

      // Customer truy cập admin routes → redirect về home
      return <Navigate to="/" replace />;
    }
  }

  // Đã đăng nhập và đúng role → render children
  return children;
};

export default ProtectedRoute;