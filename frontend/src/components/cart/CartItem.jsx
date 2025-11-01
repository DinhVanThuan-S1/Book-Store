/**
 * ==============================================
 * CART ITEM COMPONENT
 * ==============================================
 * Component hiển thị 1 item trong giỏ hàng
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, InputNumber, Button, Space, Image } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { formatPrice } from '@utils/formatPrice';
import './CartItem.scss';

/**
 * CartItem Component
 * @param {Object} props
 * @param {Object} props.item - Cart item data
 * @param {Function} props.onUpdateQuantity - Callback cập nhật số lượng
 * @param {Function} props.onRemove - Callback xóa item
 */
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  // Lấy thông tin sách/combo
  const product = item.type === 'book' ? item.book : item.combo;

  if (!product) return null;

  /**
   * Handle quantity change
   */
  const handleQuantityChange = (value) => {
    if (value && value > 0 && value <= 10) {
      onUpdateQuantity(item._id, value);
    }
  };

  /**
   * Handle remove
   */
  const handleRemove = () => {
    onRemove(item._id);
  };

  // Calculate subtotal
  const subtotal = item.price * item.quantity;

  return (
    <Card className="cart-item" bordered={false}>
      <div className="cart-item-content">
        {/* Image */}
        <Link to={`/books/${product.slug || product._id}`} className="cart-item-image">
          <Image
            src={
              item.type === 'book'
                ? product.images?.[0]
                : product.image
            }
            alt={product.title || product.name}
            preview={false}
            fallback="https://via.placeholder.com/100x140?text=No+Image"
          />
        </Link>

        {/* Info */}
        <div className="cart-item-info">
          <Link
            to={`/books/${product.slug || product._id}`}
            className="cart-item-title"
          >
            {product.title || product.name}
          </Link>

          {item.type === 'book' && (
            <div className="cart-item-author">
              {product.author?.name || 'Unknown Author'}
            </div>
          )}

          {item.type === 'combo' && (
            <div className="cart-item-combo-info">
              Combo gồm {product.books?.length || 0} quyển sách
            </div>
          )}

          <div className="cart-item-price">
            <span className="price-label">Đơn giá:</span>
            <span className="price-value">{formatPrice(item.price)}</span>
          </div>
        </div>

        {/* Quantity */}
        <div className="cart-item-quantity">
          <div className="quantity-label">Số lượng</div>
          <InputNumber
            min={1}
            max={10}
            value={item.quantity}
            onChange={handleQuantityChange}
            size="large"
          />
        </div>

        {/* Subtotal */}
        <div className="cart-item-subtotal">
          <div className="subtotal-label">Thành tiền</div>
          <div className="subtotal-value">{formatPrice(subtotal)}</div>
        </div>

        {/* Actions */}
        <div className="cart-item-actions">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          >
            Xóa
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;