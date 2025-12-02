/**
 * ==============================================
 * LOGIN PAGE
 * ==============================================
 * Trang đăng nhập
 */

import React from 'react';
import { } from 'antd';
import LoginForm from '@components/auth/LoginForm';
import './AuthPages.scss';

const LoginPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-content">
        <div className="auth-container">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
