/**
 * ==============================================
 * PROTECTED ROUTE COMPONENT
 * ==============================================
 * Component bảo vệ routes yêu cầu đăng nhập
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loading from './Loading';

/**
 * ProtectedRoute Component
 * @param {Object} props
 * @param {React.Component} props.children - Component con
 * @param {String} props.requiredRole - Role yêu cầu (admin/customer)
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Đang loading
  if (loading) {
    return <Loading fullScreen />;
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role (nếu có yêu cầu)
  if (requiredRole) {
    // Lấy role từ user (admin hoặc customer)
    const userRole = user?.role || 'customer';

    if (userRole !== requiredRole) {
      // Không đúng role → redirect về home
      return <Navigate to="/" replace />;
    }
  }

  // Đã đăng nhập và đúng role → render children
  return children;
};

export default ProtectedRoute;