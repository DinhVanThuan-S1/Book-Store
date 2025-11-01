/**
 * ==============================================
 * BOOK CARD COMPONENT
 * ==============================================
 * Component hiển thị thông tin sách dạng card
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Tag, Rate, Button, Space } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { formatPrice } from '@utils/formatPrice';
import './BookCard.scss';

const { Meta } = Card;

/**
 * BookCard Component
 * @param {Object} props
 * @param {Object} props.book - Book data
 * @param {Function} props.onAddToCart - Callback khi click thêm giỏ hàng
 */
const BookCard = ({ book, onAddToCart }) => {
  /**
   * Handle add to cart
   */
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(book);
    }
  };

  return (
    <Link to={`/books/${book.slug || book._id}`}>
      <Card
        hoverable
        className="book-card"
        cover={
          <div className="book-card-cover">
            <img
              alt={book.title}
              src={book.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
            />

            {/* Discount badge */}
            {book.discountPercent > 0 && (
              <Tag color="red" className="discount-badge">
                -{book.discountPercent}%
              </Tag>
            )}

            {/* Out of stock overlay */}
            {book.availableCopies === 0 && (
              <div className="out-of-stock-overlay">
                <Tag color="default">Hết hàng</Tag>
              </div>
            )}
          </div>
        }
        actions={[
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            disabled={book.availableCopies === 0}
          >
            Thêm giỏ hàng
          </Button>,
        ]}
      >
        <Meta
          title={
            <div className="book-title" title={book.title}>
              {book.title}
            </div>
          }
          description={
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {/* Author */}
              <div className="book-author">
                {book.author?.name || 'Unknown Author'}
              </div>

              {/* Rating */}
              <div className="book-rating">
                <Rate
                  disabled
                  allowHalf
                  value={book.averageRating || 0}
                  style={{ fontSize: 14 }}
                />
                <span className="rating-text">
                  ({book.reviewCount || 0})
                </span>
              </div>

              {/* Price */}
              <div className="book-price">
                <span className="sale-price">
                  {formatPrice(book.salePrice)}
                </span>
                {book.discountPercent > 0 && (
                  <span className="original-price">
                    {formatPrice(book.originalPrice)}
                  </span>
                )}
              </div>

              {/* Stock info */}
              <div className="book-stock">
                {book.availableCopies > 0 ? (
                  <span className="in-stock">
                    Còn {book.availableCopies} quyển
                  </span>
                ) : (
                  <span className="out-of-stock">Hết hàng</span>
                )}
              </div>
            </Space>
          }
        />
      </Card>
    </Link>
  );
};

export default BookCard;