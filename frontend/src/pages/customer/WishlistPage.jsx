/**
 * ==============================================
 * WISHLIST PAGE
 * ==============================================
 * Trang danh sách yêu thích
 * Author: DinhVanThuan-S1
 * Date: 2025-11-04
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Row,
  Col,
  Breadcrumb,
  Card,
  Button,
  Empty,
  Space,
  Typography,
  Popconfirm,
} from 'antd';
import {
  HomeOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { wishlistApi } from '@api';
import { addToCart } from '@redux/slices/cartSlice';
import { formatPrice } from '@utils/formatPrice';
import { showSuccess, showError } from '@utils/notification';
import Loading from '@components/common/Loading';
import './WishlistPage.scss';

const { Title, Text } = Typography;

const WishlistPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingItems, setProcessingItems] = useState([]);

  /**
   * Fetch wishlist
   */
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistApi.getWishlist();
      setWishlist(response.data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      showError('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  /**
   * Handle add to cart
   */
  const handleAddToCart = async (book) => {
    if (processingItems.includes(book._id)) return;

    try {
      setProcessingItems((prev) => [...prev, book._id]);

      await dispatch(
        addToCart({
          type: 'book',
          bookId: book._id,
          quantity: 1,
        })
      ).unwrap();

      showSuccess('Đã thêm vào giỏ hàng!');
    } catch (error) {
      showError(error || 'Không thể thêm vào giỏ hàng');
    } finally {
      setProcessingItems((prev) => prev.filter((id) => id !== book._id));
    }
  };

  /**
   * Handle remove from wishlist
   */
  const handleRemove = async (bookId) => {
    try {
      await wishlistApi.removeFromWishlist(bookId);
      showSuccess('Đã xóa khỏi danh sách yêu thích');

      // Refresh wishlist
      fetchWishlist();
    } catch (error) {
      showError('Không thể xóa khỏi danh sách', error);
    }
  };

  /**
   * Handle move all to cart
   */
  const handleMoveAllToCart = async () => {
    try {
      const response = await wishlistApi.moveAllToCart();

      showSuccess(`Đã chuyển ${response.data.addedCount} sản phẩm vào giỏ hàng`);

      // Refresh wishlist
      fetchWishlist();
    } catch (error) {
      showError('Không thể chuyển vào giỏ hàng', error);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const books = wishlist?.books || [];

  return (
    <div className="wishlist-page">
      <div className="page-content">
        <div className="container">
          {/* Breadcrumb */}
          <Breadcrumb className="page-breadcrumb">
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Danh sách yêu thích</Breadcrumb.Item>
          </Breadcrumb>

          {/* Header */}
          <div className="page-header">
            <Title level={2}>Danh sách yêu thích ({books.length})</Title>

            {books.length > 0 && (
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handleMoveAllToCart}
              >
                Thêm tất cả vào giỏ hàng
              </Button>
            )}
          </div>

          {/* Content */}
          {books.length === 0 ? (
            <Empty
              description="Danh sách yêu thích trống"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => navigate('/books')}>
                Khám phá sách
              </Button>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {books.map((item) => {
                const book = item.book;
                if (!book) return null;

                return (
                  <Col key={book._id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      className="wishlist-card"
                      cover={
                        <div
                          className="book-cover"
                          onClick={() => navigate(`/books/${book.slug || book._id}`)}
                        >
                          <img
                            src={book.images?.[0]}
                            alt={book.title}
                          />
                        </div>
                      }
                    >
                      <div
                        className="book-title"
                        onClick={() => navigate(`/books/${book.slug || book._id}`)}
                      >
                        {book.title}
                      </div>

                      <div className="book-author">
                        {book.author?.name}
                      </div>

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

                      <div className="book-stock">
                        {book.availableCopies > 0 ? (
                          <Text type="success">Còn hàng</Text>
                        ) : (
                          <Text type="danger">Hết hàng</Text>
                        )}
                      </div>

                      <div className="card-actions">
                        <Button
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          onClick={() => handleAddToCart(book)}
                          disabled={
                            book.availableCopies === 0 ||
                            processingItems.includes(book._id)
                          }
                          loading={processingItems.includes(book._id)}
                        >
                          Thêm giỏ hàng
                        </Button>

                        <Popconfirm
                          title="Xóa khỏi danh sách yêu thích?"
                          onConfirm={() => handleRemove(book._id)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;