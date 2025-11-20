/**
 * ==============================================
 * CREDIT CARD FORM
 * ==============================================
 * Form thanh toán thẻ tín dụng/ghi nợ (giả lập)
 */

import React, { useState } from 'react';
import { Form, Input, Row, Col, Alert } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';

const CreditCardForm = () => {
  const [cardType, setCardType] = useState('');

  // Detect card type from card number
  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return '';
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div style={{ marginTop: 16, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
      <Alert
        message="Thanh toán bằng thẻ"
        description="Đây là form giả lập. Thông tin thẻ chỉ để demo, không thực hiện giao dịch thật."
        type="info"
        showIcon
        icon={<CreditCardOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        name="cardNumber"
        label="Số thẻ"
        rules={[
          { required: true, message: 'Vui lòng nhập số thẻ!' },
          { pattern: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, message: 'Số thẻ không hợp lệ!' }
        ]}
      >
        <Input
          prefix={<CreditCardOutlined />}
          placeholder="1234 5678 9012 3456"
          size="large"
          maxLength={19}
          onChange={(e) => {
            const formatted = formatCardNumber(e.target.value);
            e.target.value = formatted;
            setCardType(detectCardType(formatted));
          }}
          suffix={
            cardType && (
              <span style={{
                fontSize: 12,
                color: '#1890ff',
                fontWeight: 'bold',
                padding: '2px 8px',
                background: '#e6f7ff',
                borderRadius: 4
              }}>
                {cardType}
              </span>
            )
          }
        />
      </Form.Item>

      <Form.Item
        name="cardName"
        label="Tên trên thẻ"
        rules={[{ required: true, message: 'Vui lòng nhập tên trên thẻ!' }]}
      >
        <Input
          placeholder="NGUYEN VAN A"
          size="large"
          style={{ textTransform: 'uppercase' }}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="cardExpiry"
            label="Ngày hết hạn"
            rules={[
              { required: true, message: 'Vui lòng nhập ngày hết hạn!' },
              { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Định dạng: MM/YY' }
            ]}
          >
            <Input
              placeholder="MM/YY"
              size="large"
              maxLength={5}
              onChange={(e) => {
                e.target.value = formatExpiry(e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="cardCVV"
            label="Mã CVV"
            rules={[
              { required: true, message: 'Vui lòng nhập mã CVV!' },
              { pattern: /^\d{3,4}$/, message: 'CVV phải là 3-4 chữ số!' }
            ]}
          >
            <Input.Password
              placeholder="123"
              size="large"
              maxLength={4}
            />
          </Form.Item>
        </Col>
      </Row>

      <div style={{
        marginTop: 16,
        padding: 12,
        background: '#fff',
        borderRadius: 4,
        border: '1px solid #52c41a'
      }}>
        <div style={{ color: '#52c41a', fontSize: 12, marginBottom: 4 }}>
          💡 <strong>Thẻ demo:</strong>
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>
          • Visa: 4532 1234 5678 9010<br />
          • Mastercard: 5425 2334 3010 9903<br />
          • Tên: NGUYEN VAN A<br />
          • Hết hạn: 12/25<br />
          • CVV: 123
        </div>
      </div>
    </div>
  );
};

export default CreditCardForm;
