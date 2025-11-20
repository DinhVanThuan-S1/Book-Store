/**
 * ==============================================
 * BANK TRANSFER FORM
 * ==============================================
 * Form thanh toán chuyển khoản ngân hàng (giả lập)
 */

import React from 'react';
import { Form, Input, Select, Alert } from 'antd';
import { BankOutlined } from '@ant-design/icons';

const { Option } = Select;

const BankTransferForm = () => {
  const banks = [
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'TCB', name: 'Techcombank' },
    { code: 'BIDV', name: 'BIDV' },
    { code: 'VTB', name: 'Vietinbank' },
    { code: 'MB', name: 'MB Bank' },
    { code: 'ACB', name: 'ACB' },
    { code: 'VPB', name: 'VPBank' },
    { code: 'TPB', name: 'TPBank' },
  ];

  return (
    <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
      <Alert
        message="Thanh toán chuyển khoản"
        description="Đây là form giả lập. Thông tin chỉ để demo, không thực hiện giao dịch thật."
        type="info"
        showIcon
        icon={<BankOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        name="bankCode"
        label="Chọn ngân hàng"
        rules={[{ required: true, message: 'Vui lòng chọn ngân hàng!' }]}
      >
        <Select placeholder="Chọn ngân hàng của bạn" size="large">
          {banks.map(bank => (
            <Option key={bank.code} value={bank.code}>
              {bank.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="accountNumber"
        label="Số tài khoản"
        rules={[
          { required: true, message: 'Vui lòng nhập số tài khoản!' },
          { pattern: /^\d{9,14}$/, message: 'Số tài khoản phải từ 9-14 chữ số!' }
        ]}
      >
        <Input
          placeholder="Nhập số tài khoản ngân hàng"
          size="large"
          maxLength={14}
        />
      </Form.Item>

      <Form.Item
        name="accountName"
        label="Tên chủ tài khoản"
        rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản!' }]}
      >
        <Input
          placeholder="Nhập tên chủ tài khoản"
          size="large"
          style={{ textTransform: 'uppercase' }}
        />
      </Form.Item>
    </div>
  );
};

export default BankTransferForm;
