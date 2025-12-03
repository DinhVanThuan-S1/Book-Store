/**
 * ==============================================
 * REGISTER FORM COMPONENT
 * ==============================================
 * Form đăng ký
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { registerUser } from '@redux/slices/authSlice';
import { useMessage } from '@utils/notification';
import './RegisterForm.scss';

/**
 * Chuyển đổi thông báo lỗi sang tiếng Việt
 */
const getVietnameseErrorMessage = (error) => {
  const errorMap = {
    'Email already exists': 'Email này đã được sử dụng',
    'Phone number already exists': 'Số điện thoại này đã được sử dụng',
    'User already exists': 'Tài khoản đã tồn tại',
    'Invalid email format': 'Định dạng email không hợp lệ',
    'Password must be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
    'Network error. Please check your connection.': 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
    'Something went wrong': 'Có lỗi xảy ra. Vui lòng thử lại.',
  };

  return errorMap[error] || error;
};

/**
 * RegisterForm Component
 */
const RegisterForm = () => {
  const { message } = useMessage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [form] = Form.useForm();

  /**
   * Handle form submit
   */
  const onFinish = async (values) => {
    try {
      setLoading(true);
      setRegisterError(null); // Reset error

      // Xóa confirmPassword trước khi gửi
      const { confirmPassword, ...registerData } = values;

      await dispatch(registerUser(registerData)).unwrap();

      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      // Bắt error message từ nhiều nguồn
      console.log('Register error object:', error);
      const errorMsg = typeof error === 'string'
        ? error
        : (error?.message || 'Đăng ký thất bại. Vui lòng thử lại.');

      const errorMessage = getVietnameseErrorMessage(errorMsg);
      setRegisterError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form">
      <h2 className="form-title">Đăng ký tài khoản</h2>
      <p className="form-subtitle">
        Tạo tài khoản mới để trải nghiệm mua sắm tốt nhất!
      </p>

      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        size="large"
        layout="vertical"
        scrollToFirstError
      >
        {/* Error Alert */}
        {registerError && (
          <div className="register-error-alert" style={{
            padding: '12px 16px',
            marginBottom: '16px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '8px',
            color: '#cf1322',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            ⚠️ {registerError}
          </div>
        )}

        {/* Full Name */}
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[
            { required: true, message: 'Vui lòng nhập họ tên!' },
            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' },
          ]}
          validateStatus={registerError ? 'error' : ''}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Nguyễn Văn A"
          />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
          validateStatus={registerError ? 'error' : ''}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="example@email.com"
          />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            {
              pattern: /^[0-9]{10,11}$/,
              message: 'Số điện thoại không hợp lệ (10-11 số)!',
            },
          ]}
          validateStatus={registerError ? 'error' : ''}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="0912345678"
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
          hasFeedback
          validateStatus={registerError ? 'error' : ''}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu"
          />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu không khớp!'));
              },
            }),
          ]}
          validateStatus={registerError ? 'error' : ''}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập lại mật khẩu"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
          >
            Đăng ký
          </Button>
        </Form.Item>

        {/* Login Link */}
        <div className="form-footer">
          Đã có tài khoản?{' '}
          <Link to="/login" className="login-link">
            Đăng nhập ngay
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default RegisterForm;
