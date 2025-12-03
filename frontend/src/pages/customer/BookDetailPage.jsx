/**
 * ==============================================
 * BOOK DETAIL PAGE - COMPLETE VERSION
 * ==============================================
 * Trang chi tiết sách với đầy đủ tính năng:
 * - Thông tin sách
 * - Thêm vào giỏ hàng
 * - Wishlist
 * - Đánh giá & Rating
 * - Sách liên quan
 * 
 * Author: DinhVanThuan-S1
 * Date: 2025-11-04
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Breadcrumb,
  Image,
  Typography,
  Rate,
  Tag,
  InputNumber,
  Button,
  Space,
  Divider,
  Descriptions,
  Card,
  Tabs,
  message,
} from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
} from '@ant-design/icons';
import { bookApi, wishlistApi } from '@api';
import { addToCart } from '@redux/slices/cartSlice';
import { formatPrice } from '@utils/formatPrice';
import { useMessage } from '@utils/notification';
import {
  BOOK_FORMAT_LABELS,
  LANGUAGE_LABELS,
} from '@constants/appConstants';
import Loading from '@components/common/Loading';
import RatingSummary from '@components/review/RatingSummary';
import ReviewList from '@components/review/ReviewList';
import BookList from '@components/book/BookList';
import './BookDetailPage.scss';


const { Title, Paragraph, Text } = Typography;

const BookDetailPage = () => {
  const { message } = useMessage();
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  // Redux state
  const { isAuthenticated } = useSelector((state) => state.auth);

  /**
   * Fetch book detail
   */
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await bookApi.getBookBySlug(slug);
        setBook(response.data.book);
      } catch (error) {
        console.error('Error fetching book:', error);
        message.error('Không tìm thấy sách');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [slug, navigate]);

  /**
   * Fetch related books
   */
  useEffect(() => {
    const fetchRelatedBooks = async () => {
      if (book?.category) {
        try {
          const response = await bookApi.getBooks({
            category: book.category._id,
            limit: 8,
          });

          // Lọc bỏ sách hiện tại
          const filtered = response.data.books.filter(
            (b) => b._id !== book._id
          );
          setRelatedBooks(filtered);
        } catch (error) {
          console.error('Error fetching related books:', error);
        }
      }
    };

    fetchRelatedBooks();
  }, [book]);

  /**
   * Check if book in wishlist
   */
  useEffect(() => {
    const checkWishlist = async () => {
      if (book?._id && isAuthenticated) {
        try {
          const response = await wishlistApi.checkInWishlist(book._id);
          setInWishlist(response.data.inWishlist);
        } catch (error) {
          console.error('Error checking wishlist:', error);
        }
      }
    };

    checkWishlist();
  }, [book, isAuthenticated]);

  /**
   * Handle add to cart
   */
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      message.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);

      await dispatch(
        addToCart({
          type: 'book',
          bookId: book._id,
          quantity,
        })
      ).unwrap();

      message.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      message.error(error || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  /**
   * Handle buy now
   */
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      message.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    await handleAddToCart();
    navigate('/cart');
  };

  /**
   * Handle toggle wishlist
   */
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      message.error('Vui lòng đăng nhập để sử dụng tính năng này');
      navigate('/login');
      return;
    }

    try {
      setAddingToWishlist(true);

      if (inWishlist) {
        await wishlistApi.removeFromWishlist(book._id);
        message.success('Đã xóa khỏi danh sách yêu thích');
        setInWishlist(false);
      } else {
        await wishlistApi.addToWishlist(book._id);
        message.success('Đã thêm vào danh sách yêu thích');
        setInWishlist(true);
      }
    } catch (error) {
      message.error(error || 'Không thể cập nhật danh sách yêu thích');
    } finally {
      setAddingToWishlist(false);
    }
  };

  /**
   * Handle share
   */
  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: book.title,
          text: book.description,
          url: url,
        })
        .then(() => message.success('Đã chia sẻ!'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        message.success('Đã copy link!');
      });
    }
  };

  /**
   * Handle add related book to cart
   */
  const handleAddRelatedBookToCart = async (relatedBook) => {
    if (!isAuthenticated) {
      message.error('Vui lòng đăng nhập');
      navigate('/login');
      return;
    }

    try {
      await dispatch(
        addToCart({
          type: 'book',
          bookId: relatedBook._id,
          quantity: 1,
        })
      ).unwrap();

      message.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      message.error(error || 'Không thể thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!book) {
    return null;
  }

  /**
   * Tabs items
   */
  const tabItems = [
    {
      key: 'description',
      label: 'Mô tả sản phẩm',
      children: (
        <div className="tab-content">
          <div
            className="book-description-content"
            dangerouslySetInnerHTML={{ __html: book.description }}
          />
        </div>
      ),
    },
    {
      key: 'specs',
      label: 'Thông số kỹ thuật',
      children: (
        <div className="tab-content">
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Tác giả">
              {book.author?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Nhà xuất bản">
              {book.publisher?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              {book.category?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Năm xuất bản">
              {book.publishYear}
            </Descriptions.Item>
            <Descriptions.Item label="Số trang">
              {book.pages} trang
            </Descriptions.Item>
            <Descriptions.Item label="Ngôn ngữ">
              {LANGUAGE_LABELS[book.language] || book.language}
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức">
              {BOOK_FORMAT_LABELS[book.format] || book.format}
            </Descriptions.Item>
            {book.isbn && (
              <Descriptions.Item label="ISBN">
                {book.isbn}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Lượt xem">
              {book.viewCount || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Đã bán">
              {book.purchaseCount || 0}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'reviews',
      label: `Đánh giá (${book.reviewCount || 0})`,
      children: (
        <div className="tab-content">
          <RatingSummary book={book} />
          <Divider />
          <ReviewList bookId={book._id} />
        </div>
      ),
    },
  ];

  return (
    <div className="book-detail-page">
      <div className="page-content">
        <div className="container">
          {/* Breadcrumb */}
          <Breadcrumb className="page-breadcrumb">
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/books">Danh sách sách</Breadcrumb.Item>
            {book.category && (
              <Breadcrumb.Item
                href={`/books?category=${book.category._id}`}
              >
                {book.category.name}
              </Breadcrumb.Item>
            )}
            <Breadcrumb.Item>{book.title}</Breadcrumb.Item>
          </Breadcrumb>

          {/* Book Detail */}
          <Row gutter={[32, 32]}>
            {/* Images */}
            <Col xs={24} md={10} lg={8}>
              <div className="book-images">
                <Image.PreviewGroup>
                  <Image
                    src={book.images[0]}
                    alt={book.title}
                    className="main-image"
                    fallback="https://via.placeholder.com/400x560?text=No+Image"
                  />

                  {book.images.length > 1 && (
                    <div className="thumbnail-images">
                      {book.images.slice(1, 5).map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`${book.title} ${index + 2}`}
                          width={80}
                          height={112}
                          style={{ objectFit: 'cover', borderRadius: 8 }}
                          preview={{
                            src: image,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </Image.PreviewGroup>

                {/* Social Actions */}
                <div className="social-actions">
                  <Button
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                    block
                  >
                    Chia sẻ
                  </Button>
                </div>
              </div>
            </Col>

            {/* Info */}
            <Col xs={24} md={14} lg={16}>
              <div className="book-info">
                {/* Category */}
                {book.category && (
                  <div className="book-category">
                    <Tag color="blue">{book.category.name}</Tag>
                  </div>
                )}

                {/* Title */}
                <Title level={2} className="book-title">
                  {book.title}
                </Title>

                {/* Author & Publisher */}
                <Space split={<Divider type="vertical" />} className="book-meta">
                  <Text type="secondary">
                    Tác giả: <strong>{book.author?.name}</strong>
                  </Text>
                  <Text type="secondary">
                    NXB: <strong>{book.publisher?.name}</strong>
                  </Text>
                </Space>

                {/* Rating */}
                <div className="book-rating">
                  <Rate
                    disabled
                    allowHalf
                    value={book.averageRating}
                    style={{ fontSize: 20 }}
                  />
                  <Text strong style={{ fontSize: 18, marginLeft: 8 }}>
                    {book.averageRating?.toFixed(1) || 0}
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({book.reviewCount || 0} đánh giá)
                  </Text>
                  <Divider type="vertical" />
                  <Text type="secondary">
                    {book.purchaseCount || 0} đã bán
                  </Text>
                </div>

                {/* Price Card */}
                <Card className="price-card">
                  <div className="price-section">
                    <Space align="start" size="large">
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                          Giá bán:
                        </Text>
                        <Space align="center">
                          <span className="sale-price">
                            {formatPrice(book.salePrice)}
                          </span>
                          {book.discountPercent > 0 && (
                            <>
                              <span className="original-price">
                                {formatPrice(book.originalPrice)}
                              </span>
                              <Tag color="red" style={{ fontSize: 14 }}>
                                -{book.discountPercent}%
                              </Tag>
                            </>
                          )}
                        </Space>
                      </div>
                    </Space>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Stock Info */}
                  <div className="stock-section">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text type="secondary">Tình trạng:</Text>
                        <div style={{ marginTop: 4 }}>
                          {book.availableCopies > 0 ? (
                            <Text type="success" strong>
                              ✓ Còn hàng ({book.availableCopies} quyển)
                            </Text>
                          ) : (
                            <Text type="danger" strong>
                              ✗ Hết hàng
                            </Text>
                          )}
                        </div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">Vận chuyển:</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text>Miễn phí từ 300.000₫</Text>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card>

                {/* Quantity & Actions */}
                <div className="purchase-section">
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Quantity */}
                    <Space size="middle">
                      <Text strong>Số lượng:</Text>
                      <InputNumber
                        min={1}
                        max={Math.min(book.availableCopies, 10)}
                        value={quantity}
                        onChange={setQuantity}
                        size="large"
                        disabled={book.availableCopies === 0}
                        style={{ width: 120 }}
                      />
                      <Text type="secondary">
                        (Tối đa {Math.min(book.availableCopies, 10)} quyển)
                      </Text>
                    </Space>

                    {/* Action Buttons */}
                    <Space size="middle" wrap style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        loading={addingToCart}
                        disabled={book.availableCopies === 0}
                        style={{ minWidth: 180 }}
                      >
                        Thêm vào giỏ
                      </Button>

                      <Button
                        type="default"
                        size="large"
                        onClick={handleBuyNow}
                        disabled={book.availableCopies === 0}
                        style={{ minWidth: 150 }}
                      >
                        Mua ngay
                      </Button>

                      <Button
                        type={inWishlist ? 'primary' : 'default'}
                        size="large"
                        icon={inWishlist ? <HeartFilled /> : <HeartOutlined />}
                        onClick={handleToggleWishlist}
                        loading={addingToWishlist}
                        danger={inWishlist}
                        style={{ minWidth: 120 }}
                      >
                        {inWishlist ? 'Đã thích' : 'Yêu thích'}
                      </Button>
                    </Space>
                  </Space>
                </div>

                {/* Features */}
                <Card className="features-card" size="small">
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div className="feature-item">
                      <Text>✓ Giao hàng toàn quốc</Text>
                    </div>
                    <div className="feature-item">
                      <Text>✓ Đổi trả trong 7 ngày</Text>
                    </div>
                    <div className="feature-item">
                      <Text>✓ Kiểm tra hàng trước khi thanh toán</Text>
                    </div>
                    <div className="feature-item">
                      <Text>✓ Sách chính hãng 100%</Text>
                    </div>
                  </Space>
                </Card>
              </div>
            </Col>
          </Row>

          {/* Tabs Section */}
          <Row gutter={[32, 32]} style={{ marginTop: 48 }}>
            <Col span={24}>
              <Card>
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={tabItems}
                  size="large"
                />
              </Card>
            </Col>
          </Row>

          {/* Related Books */}
          {relatedBooks.length > 0 && (
            <div className="related-books-section">
              <div className="section-header">
                <Title level={3}>Sách liên quan</Title>
              </div>

              <BookList
                books={relatedBooks}
                onAddToCart={handleAddRelatedBookToCart}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;

