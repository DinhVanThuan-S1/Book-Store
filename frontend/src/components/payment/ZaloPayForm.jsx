/**
 * ==============================================
 * ZALOPAY FORM
 * ==============================================
 * Form thanh toán Ví ZaloPay (giả lập)
 */

import React from 'react';
import { Form, Input, Alert } from 'antd';
import { MobileOutlined, LockOutlined } from '@ant-design/icons';

const ZaloPayForm = () => {
  return (
    <div style={{ marginTop: 16, padding: 16, background: '#f0f7ff', borderRadius: 8 }}>
      <Alert
        message="Thanh toán qua ZaloPay"
        description="Đây là form giả lập. Nhập số điện thoại và mật khẩu để demo thanh toán."
        type="info"
        showIcon
        icon={<MobileOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        name="zaloPhone"
        label="Số điện thoại ZaloPay"
        rules={[
          { required: true, message: 'Vui lòng nhập số điện thoại!' },
          { pattern: /^0\d{9}$/, message: 'Số điện thoại không hợp lệ!' }
        ]}
      >
        <Input
          prefix={<MobileOutlined />}
          placeholder="0987654321"
          size="large"
          maxLength={10}
        />
      </Form.Item>

      <Form.Item
        name="zaloPassword"
        label="Mật khẩu"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu!' },
          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Nhập mật khẩu"
          size="large"
        />
      </Form.Item>

      <div style={{
        marginTop: 16,
        padding: 12,
        background: '#fff',
        borderRadius: 4,
        border: '1px solid #0068ff'
      }}>
        <div style={{ color: '#0068ff', fontSize: 12, marginBottom: 4 }}>
          💡 <strong>Demo:</strong>
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>
          • Số điện thoại: 0987654321<br />
          • Mật khẩu: zalopay123
        </div>
      </div>
    </div>
  );
};

export default ZaloPayForm;
