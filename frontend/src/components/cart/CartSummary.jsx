/**
 * ==============================================
 * CART SUMMARY COMPONENT
 * ==============================================
 * Component hiển thị tổng kết giỏ hàng
 */

import React from 'react';
import { Card, Divider, Button, Space } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { formatPrice } from '@utils/formatPrice';
import './CartSummary.scss';

/**
 * CartSummary Component
 * @param {Object} props
 * @param {Number} props.subtotal - Tổng tiền hàng
 * @param {Number} props.shippingFee - Phí ship
 * @param {Number} props.discount - Giảm giá
 * @param {Number} props.total - Tổng cộng
 * @param {Function} props.onCheckout - Callback thanh toán
 * @param {Boolean} props.loading - Loading state
 */
const CartSummary = ({
  subtotal = 0,
  shippingFee = 25000,
  discount = 0,
  total = 0,
  onCheckout,
  loading = false,
}) => {
  return (
    <Card className="cart-summary" title="Thông tin đơn hàng">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Subtotal */}
        <div className="summary-row">
          <span className="summary-label">Tạm tính:</span>
          <span className="summary-value">{formatPrice(subtotal)}</span>
        </div>

        {/* Shipping Fee */}
        <div className="summary-row">
          <span className="summary-label">Phí vận chuyển:</span>
          <span className="summary-value">{formatPrice(shippingFee)}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="summary-row">
            <span className="summary-label">Giảm giá:</span>
            <span className="summary-value discount">
              -{formatPrice(discount)}
            </span>
          </div>
        )}

        <Divider style={{ margin: 0 }} />

        {/* Total */}
        <div className="summary-row total">
          <span className="summary-label">Tổng cộng:</span>
          <span className="summary-value">{formatPrice(total)}</span>
        </div>

        {/* Checkout Button */}
        <Button
          type="primary"
          size="large"
          block
          icon={<ShoppingCartOutlined />}
          onClick={onCheckout}
          loading={loading}
        >
          Tiến hành thanh toán
        </Button>

        {/* Note */}
        <div className="summary-note">
          * Miễn phí vận chuyển cho đơn hàng từ 300.000đ
        </div>
      </Space>
    </Card>
  );
};

export default CartSummary;