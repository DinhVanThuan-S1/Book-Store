/**
 * ==============================================
 * REGISTER PAGE
 * ==============================================
 * Trang đăng ký
 */

import React from 'react';
import { } from 'antd';
import RegisterForm from '@components/auth/RegisterForm';
import './AuthPages.scss';


const RegisterPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-content">
        <div className="auth-container">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
