/**
 * ==============================================
 * MOMO FORM
 * ==============================================
 * Form thanh toán Ví MoMo (giả lập)
 */

import React from 'react';
import { Form, Input, Alert } from 'antd';
import { MobileOutlined, LockOutlined } from '@ant-design/icons';

const MoMoForm = () => {
  return (
    <div style={{ marginTop: 16, padding: 16, background: '#fef5f9', borderRadius: 8 }}>
      <Alert
        message="Thanh toán qua Ví MoMo"
        description="Đây là form giả lập. Nhập số điện thoại và mã PIN để demo thanh toán."
        type="info"
        showIcon
        icon={<MobileOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        name="momoPhone"
        label="Số điện thoại MoMo"
        rules={[
          { required: true, message: 'Vui lòng nhập số điện thoại!' },
          { pattern: /^0\d{9}$/, message: 'Số điện thoại không hợp lệ!' }
        ]}
      >
        <Input
          prefix={<MobileOutlined />}
          placeholder="0912345678"
          size="large"
          maxLength={10}
        />
      </Form.Item>

      <Form.Item
        name="momoPin"
        label="Mã PIN"
        rules={[
          { required: true, message: 'Vui lòng nhập mã PIN!' },
          { pattern: /^\d{6}$/, message: 'Mã PIN phải là 6 chữ số!' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Nhập mã PIN 6 số"
          size="large"
          maxLength={6}
        />
      </Form.Item>

      <div style={{
        marginTop: 16,
        padding: 12,
        background: '#fff',
        borderRadius: 4,
        border: '1px solid #d91f5a'
      }}>
        <div style={{ color: '#d91f5a', fontSize: 12, marginBottom: 4 }}>
          💡 <strong>Demo:</strong>
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>
          • Số điện thoại: 0912345678<br />
          • Mã PIN: 123456
        </div>
      </div>
    </div>
  );
};

export default MoMoForm;
