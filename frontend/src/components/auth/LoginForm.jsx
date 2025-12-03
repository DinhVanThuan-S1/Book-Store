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
 * Chuyển đổi thông báo lỗi sang tiếng Việt
 */
const getVietnameseErrorMessage = (error) => {
  const errorMap = {
    'Invalid email or password': 'Email hoặc mật khẩu không đúng',
    'Account has been deactivated': 'Tài khoản đã bị vô hiệu hóa',
    'User not found': 'Không tìm thấy tài khoản',
    'Invalid credentials': 'Thông tin đăng nhập không chính xác',
    'Network error. Please check your connection.': 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
    'Something went wrong': 'Có lỗi xảy ra. Vui lòng thử lại.',
  };

  return errorMap[error] || error;
};

/**
 * LoginForm Component
 */
const LoginForm = () => {
  const { message } = useMessage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  /**
   * Handle form submit
   */
  const onFinish = async (values) => {
    try {
      setLoading(true);
      setLoginError(null); // Reset error

      const result = await dispatch(loginUser(values)).unwrap();

      message.success('Đăng nhập thành công!');

      // Redirect về trang trước hoặc home
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      navigate(returnUrl || '/');
    } catch (error) {
      // Bắt error message từ nhiều nguồn
      console.log('Login error object:', error);
      const errorMsg = typeof error === 'string'
        ? error
        : (error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');

      const errorMessage = getVietnameseErrorMessage(errorMsg);
      setLoginError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }; return (
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
        {/* Error Alert */}
        {loginError && (
          <div className="login-error-alert" style={{
            padding: '12px 16px',
            marginBottom: '16px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '8px',
            color: '#cf1322',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            ⚠️ {loginError}
          </div>
        )}

        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
          validateStatus={loginError ? 'error' : ''}
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
          validateStatus={loginError ? 'error' : ''}
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
