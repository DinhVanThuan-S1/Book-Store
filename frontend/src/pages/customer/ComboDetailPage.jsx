/**
 * ==============================================
 * COMBO DETAIL PAGE
 * ==============================================
 * Trang chi tiết combo
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Row,
  Col,
  Typography,
  Card,
  Button,
  Image,
  Tag,
  Divider,
  Spin,
  Table,
} from 'antd';
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { comboApi } from '@api';
import { addToCart } from '@redux/slices/cartSlice';
import { showSuccess, showError } from '@utils/notification';
import { formatPrice } from '@utils/formatPrice';
import './ComboDetailPage.scss';

const { Title, Text, Paragraph } = Typography;

/**
 * ComboDetailPage Component
 */
const ComboDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  /**
   * Fetch combo detail
   */
  useEffect(() => {
    const fetchComboDetail = async () => {
      try {
        setLoading(true);
        const response = await comboApi.getComboById(id);
        setCombo(response.data.combo);

        // Check availability
        const availabilityResponse = await comboApi.checkComboAvailability(id);
        setIsAvailable(availabilityResponse.data.isAvailable);
      } catch (error) {
        console.error('Error fetching combo:', error);
        showError('Không thể tải thông tin combo');
      } finally {
        setLoading(false);
      }
    };

    fetchComboDetail();
  }, [id]);

  /**
   * Handle add to cart
   */
  const handleAddToCart = async () => {
    try {
      await dispatch(
        addToCart({
          type: 'combo',
          comboId: combo._id,
          quantity: 1,
        })
      ).unwrap();

      showSuccess('Đã thêm combo vào giỏ hàng!');
    } catch (error) {
      showError(error || 'Không thể thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="combo-detail-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="combo-detail-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Title level={3}>Không tìm thấy combo</Title>
            <Button type="primary" onClick={() => navigate('/combos')}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const discount = combo.totalOriginalPrice - combo.comboPrice;
  const percent = Math.round((discount / combo.totalOriginalPrice) * 100);

  const bookColumns = [
    {
      title: 'Sách',
      dataIndex: ['book'],
      key: 'book',
      render: (book) => (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => navigate(`/books/${book?.slug}`)}
        >
          {book?.images?.[0] && (
            <Image
              src={book.images[0]}
              alt={book.title}
              width={50}
              height={70}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              preview={false}
            />
          )}
          <Text strong style={{ color: '#1890ff' }}>{book?.title || 'N/A'}</Text>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
      render: (qty) => <Tag color="blue">x{qty}</Tag>,
    },
    {
      title: 'Giá gốc',
      dataIndex: ['book', 'originalPrice'],
      key: 'originalPrice',
      width: 120,
      render: (price, record) => (
        <div>
          <div>
            <Text>{formatPrice(price)}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tổng: {formatPrice(price * record.quantity)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Giá giảm',
      dataIndex: ['book', 'salePrice'],
      key: 'price',
      width: 120,
      render: (price, record) => (
        <div>
          <div>
            <Text strong style={{ color: '#f5222d' }}>{formatPrice(price)}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tổng: {formatPrice(price * record.quantity)}
            </Text>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="combo-detail-page">
      <div className="container">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/combos')}
          style={{ marginBottom: 20 }}
        >
          Quay lại danh sách combo
        </Button>

        <Row gutter={[32, 32]}>
          {/* Left: Image */}
          <Col xs={24} md={10}>
            <Card className="image-card">
              <div className="combo-image-wrapper">
                <Image
                  src={combo.image}
                  alt={combo.name}
                  className="combo-image"
                />
                <div className="discount-badge">
                  <Tag color="red" style={{ fontSize: 18, padding: '6px 16px' }}>
                    -{percent}%
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right: Info */}
          <Col xs={24} md={14}>
            <div className="combo-info">
              <Title level={2}>{combo.name}</Title>

              <div className="combo-status">
                {isAvailable ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Còn hàng
                  </Tag>
                ) : (
                  <Tag color="default">Hết hàng</Tag>
                )}
              </div>

              {combo.description && (
                <>
                  <Divider />
                  <div className="combo-description">
                    <Title level={5}>Mô tả</Title>
                    <Paragraph>{combo.description}</Paragraph>
                  </div>
                </>
              )}

              <Divider />

              <div className="combo-price-section">
                <div className="price-row">
                  <Text type="secondary">Giá gốc:</Text>
                  <Text delete style={{ fontSize: 18 }}>
                    {formatPrice(combo.totalOriginalPrice)}
                  </Text>
                </div>
                <div className="price-row">
                  <Text type="secondary">Giá combo:</Text>
                  <Text strong style={{ color: '#f5222d', fontSize: 28 }}>
                    {formatPrice(combo.comboPrice)}
                  </Text>
                </div>
                <div className="price-row">
                  <Text type="secondary">Tiết kiệm:</Text>
                  <Text strong style={{ color: '#52c41a', fontSize: 18 }}>
                    {formatPrice(discount)} ({percent}%)
                  </Text>
                </div>
              </div>

              <Divider />

              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={!isAvailable}
                block
              >
                {isAvailable ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </Button>
            </div>
          </Col>
        </Row>

        {/* Books in Combo */}
        <div style={{ marginTop: 48 }}>
          <Title level={3}>Sách trong combo ({combo.books.length})</Title>
          <Table
            dataSource={combo.books}
            columns={bookColumns}
            rowKey={(item, index) => index}
            pagination={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ComboDetailPage;
