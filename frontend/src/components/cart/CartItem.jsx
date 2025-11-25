/**
 * ==============================================
 * CART ITEM COMPONENT
 * ==============================================
 * Component hiển thị 1 item trong giỏ hàng
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, InputNumber, Button, Space, Image, Collapse, Tag } from 'antd';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
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
  const navigate = useNavigate();
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

  // Determine link
  const productLink = item.type === 'book'
    ? `/books/${product.slug || product._id}`
    : `/combos/${product._id}`;

  return (
    <Card className="cart-item" variant="borderless">
      <div className="cart-item-content">
        {/* Image */}
        <div
          className="cart-item-image"
          onClick={() => navigate(productLink)}
          style={{ cursor: 'pointer' }}
        >
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
        </div>

        {/* Info */}
        <div className="cart-item-info">
          <div
            className="cart-item-title"
            onClick={() => navigate(productLink)}
            style={{ cursor: 'pointer' }}
          >
            {product.title || product.name}
          </div>

          {item.type === 'book' && (
            <div className="cart-item-author">
              {product.author?.name || 'Unknown Author'}
            </div>
          )}

          {item.type === 'combo' && (
            <div className="cart-item-combo-info">
              <div style={{ marginBottom: 8 }}>
                Combo gồm {product.books?.length || 0} quyển sách
              </div>

              {product.books && product.books.length > 0 && (
                <Collapse
                  size="small"
                  items={[
                    {
                      key: '1',
                      label: 'Xem danh sách sách',
                      children: (
                        <div className="combo-books-list">
                          {product.books.map((bookItem, index) => (
                            <div key={index} className="combo-book-item">
                              <div
                                onClick={() => navigate(`/books/${bookItem.book?.slug || bookItem.book?._id}`)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  cursor: 'pointer'
                                }}
                              >
                                {bookItem.book?.images?.[0] && (
                                  <Image
                                    src={bookItem.book.images[0]}
                                    alt={bookItem.book.title}
                                    width={40}
                                    height={56}
                                    style={{ objectFit: 'cover', borderRadius: 4 }}
                                    preview={false}
                                  />
                                )}
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13 }}>
                                    {bookItem.book?.title || 'N/A'}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#666' }}>
                                    <Tag color="blue" style={{ margin: 0 }}>x{bookItem.quantity}</Tag>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                  ]}
                  expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                />
              )}
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