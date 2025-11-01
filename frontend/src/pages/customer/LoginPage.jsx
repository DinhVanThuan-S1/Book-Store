/**
 * ==============================================
 * LOGIN PAGE
 * ==============================================
 * Trang đăng nhập
 */

import React from 'react';
import { Layout } from 'antd';
import LoginForm from '@components/auth/LoginForm';
import './AuthPages.scss';

const { Content } = Layout;

const LoginPage = () => {
  return (
    <Layout className="auth-page">
      <Content className="auth-content">
        <div className="auth-container">
          <LoginForm />
        </div>
      </Content>
    </Layout>
  );
};

export default LoginPage;