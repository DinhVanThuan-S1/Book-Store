/**
 * ==============================================
 * LOGIN FORM COMPONENT
 * ==============================================
 * Form đăng nhập
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Form, Input, Button, Checkbox, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { loginUser } from '@redux/slices/authSlice';
import { useMessage } from '@utils/notification';
import './LoginForm.scss';

/**
 * LoginForm Component
 */
const LoginForm = () => {
  const { message } = useMessage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  /**
   * Handle form submit
   */
  const onFinish = async (values) => {
    try {
      setLoading(true);

      const result = await dispatch(loginUser(values)).unwrap();

      message.success('Đăng nhập thành công!');

      // Redirect về trang trước hoặc home
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      navigate(returnUrl || '/');
    } catch (error) {
      message.error(error || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2 className="form-title">Đăng nhập</h2>
      <p className="form-subtitle">
        Chào mừng bạn quay trở lại! Đăng nhập để tiếp tục.
      </p>

      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        {/* Email */}
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
            placeholder="example@email.com"
          />
        </Form.Item>

        {/* Password */}
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu"
          />
        </Form.Item>

        {/* Remember & Forgot Password */}
        <Form.Item>
          <div className="form-extras">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>
            <Link to="/forgot-password" className="forgot-password-link">
              Quên mật khẩu?
            </Link>
          </div>
        </Form.Item>

        {/* Submit Button */}
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

        {/* Register Link */}
        <div className="form-footer">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="register-link">
            Đăng ký ngay
          </Link>
        </div>

        {/* Social Login */}
        <Divider>Hoặc đăng nhập bằng</Divider>

        <div className="social-login">
          <Button icon={<GoogleOutlined />} block>
            Google
          </Button>
          <Button icon={<FacebookOutlined />} block>
            Facebook
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;
