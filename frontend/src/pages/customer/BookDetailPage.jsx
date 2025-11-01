/**
 * ==============================================
 * BOOK DETAIL PAGE
 * ==============================================
 * Trang chi tiết sách
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Layout,
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
} from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { bookApi } from '@api';
import { addToCart } from '@redux/slices/cartSlice';
import { formatPrice } from '@utils/formatPrice';
import { showSuccess, showError } from '@utils/notification';
import Loading from '@components/common/Loading';
import './BookDetailPage.scss';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const BookDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

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
        showError('Không tìm thấy sách');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [slug, navigate]);

  /**
   * Handle add to cart
   */
  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      await dispatch(
        addToCart({
          type: 'book',
          bookId: book._id,
          quantity,
        })
      ).unwrap();

      showSuccess('Đã thêm vào giỏ hàng!');
    } catch (error) {
      showError(error || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  /**
   * Handle buy now
   */
  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!book) {
    return null;
  }

  return (
    <Layout className="book-detail-page">
      <Content className="page-content">
        <div className="container">
          {/* Breadcrumb */}
          <Breadcrumb className="page-breadcrumb">
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/books">Danh sách sách</Breadcrumb.Item>
            <Breadcrumb.Item>{book.title}</Breadcrumb.Item>
          </Breadcrumb>

          {/* Book Detail */}
          <Row gutter={[32, 32]}>
            {/* Images */}
            <Col xs={24} md={10}>
              <div className="book-images">
                <Image.PreviewGroup>
                  <Image
                    src={book.images[0]}
                    alt={book.title}
                    className="main-image"
                  />
                  {book.images.length > 1 && (
                    <div className="thumbnail-images">
                      {book.images.slice(1).map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`${book.title} ${index + 2}`}
                          width={80}
                          height={112}
                          style={{ objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  )}
                </Image.PreviewGroup>
              </div>
            </Col>

            {/* Info */}
            <Col xs={24} md={14}>
              <div className="book-info">
                {/* Title */}
                <Title level={2}>{book.title}</Title>

                {/* Author */}
                <Text type="secondary" className="book-author">
                  Tác giả: <strong>{book.author?.name}</strong>
                </Text>

                {/* Rating */}
                <div className="book-rating">
                  <Rate disabled allowHalf value={book.averageRating} />
                  <Text type="secondary">
                    ({book.reviewCount} đánh giá)
                  </Text>
                </div>

                {/* Price */}
                <Card className="price-card">
                  <Space direction="vertical" size="small">
                    <div className="price-section">
                      <span className="sale-price">
                        {formatPrice(book.salePrice)}
                      </span>
                      {book.discountPercent > 0 && (
                        <>
                          <span className="original-price">
                            {formatPrice(book.originalPrice)}
                          </span>
                          <Tag color="red">-{book.discountPercent}%</Tag>
                        </>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="stock-info">
                      {book.availableCopies > 0 ? (
                        <Text type="success">
                          ✓ Còn {book.availableCopies} quyển
                        </Text>
                      ) : (
                        <Text type="danger">✗ Hết hàng</Text>
                      )}
                    </div>
                  </Space>
                </Card>

                {/* Quantity & Actions */}
                <div className="purchase-section">
                  <Space size="large">
                    <div>
                      <Text>Số lượng:</Text>
                      <InputNumber
                        min={1}
                        max={Math.min(book.availableCopies, 10)}
                        value={quantity}
                        onChange={setQuantity}
                        size="large"
                        disabled={book.availableCopies === 0}
                      />
                    </div>
                  </Space>

                  <Space size="middle" className="action-buttons">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleAddToCart}
                      loading={addingToCart}
                      disabled={book.availableCopies === 0}
                    >
                      Thêm vào giỏ
                    </Button>

                    <Button
                      type="default"
                      size="large"
                      onClick={handleBuyNow}
                      disabled={book.availableCopies === 0}
                    >
                      Mua ngay
                    </Button>

                    <Button
                      type="text"
                      size="large"
                      icon={<HeartOutlined />}
                    >
                      Yêu thích
                    </Button>
                  </Space>
                </div>

                <Divider />

                {/* Description */}
                <div className="book-description">
                  <Title level={4}>Mô tả sản phẩm</Title>
                  <Paragraph>{book.description}</Paragraph>
                </div>
              </div>
            </Col>
          </Row>

          {/* Additional Info */}
          <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
            <Col span={24}>
              <Card title="Thông tin chi tiết">
                <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Tác giả">
                    {book.author?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nhà xuất bản">
                    {book.publisher?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Năm xuất bản">
                    {book.publishYear}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số trang">
                    {book.pages} trang
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngôn ngữ">
                    {book.language}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hình thức">
                    {book.format}
                  </Descriptions.Item>
                  {book.isbn && (
                    <Descriptions.Item label="ISBN">
                      {book.isbn}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {book.fullDescription && (
                  <div
                    className="full-description"
                    dangerouslySetInnerHTML={{ __html: book.fullDescription }}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default BookDetailPage;