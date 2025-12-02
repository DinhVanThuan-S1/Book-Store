/**
 * ==============================================
 * ADMIN LOGIN PAGE
 * ==============================================
 * Trang đăng nhập cho admin
 * Author: DinhVanThuan-S1
 * Date: 2025-11-04
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Layout, Card, Form, Input, Button, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { loginAdmin } from '@redux/slices/authSlice';
import { useMessage } from '@utils/notification';
import './AdminLoginPage.scss';

const { Content } = Layout;
const { Title, Text } = Typography;

const AdminLoginPage = () => {
  const { message } = useMessage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  /**
   * Handle login
   */
  const onFinish = async (values) => {
    try {
      setLoading(true);

      const result = await dispatch(loginAdmin(values)).unwrap();

      message.success('Đăng nhập thành công!');
      navigate('/admin');
    } catch (error) {
      message.error(error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="admin-login-page">
      <Content className="login-content">
        <Card className="login-card">
          {/* Logo & Title */}
          <div className="login-header">
            <Space direction="vertical" align="center" size="large">
              <div className="logo-icon">
                <SafetyOutlined style={{ fontSize: 64, color: '#1890ff' }} />
              </div>
              <div>
                <Title level={2} style={{ marginBottom: 0 }}>
                  Admin Panel
                </Title>
                <Text type="secondary">Hệ thống quản trị BookStore</Text>
              </div>
            </Space>
          </div>

          {/* Login Form */}
          <Form
            name="admin-login"
            onFinish={onFinish}
            size="large"
            layout="vertical"
            className="login-form"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="admin@bookstore.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          {/* Help Text */}
          <div className="login-footer">
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chỉ dành cho quản trị viên hệ thống
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default AdminLoginPage;

