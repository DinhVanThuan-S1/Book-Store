/**
 * ==============================================
 * REGISTER PAGE
 * ==============================================
 * Trang đăng ký
 */

import React from 'react';
import { Layout } from 'antd';
import RegisterForm from '@components/auth/RegisterForm';
import './AuthPages.scss';

const { Content } = Layout;

const RegisterPage = () => {
  return (
    <Layout className="auth-page">
      <Content className="auth-content">
        <div className="auth-container">
          <RegisterForm />
        </div>
      </Content>
    </Layout>
  );
};

export default RegisterPage;