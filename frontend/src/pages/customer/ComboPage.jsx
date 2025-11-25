/**
 * ==============================================
 * COMBO PAGE
 * ==============================================
 * Trang danh sách combo
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Row, Col, Typography, Card, Tag, Button, Image, Empty, Spin } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { comboApi } from '@api';
import { addToCart } from '@redux/slices/cartSlice';
import { showSuccess, showError } from '@utils/notification';
import { formatPrice } from '@utils/formatPrice';
import './ComboPage.scss';

const { Title, Text, Paragraph } = Typography;

/**
 * ComboPage Component
 */
const ComboPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
  });

  /**
   * Fetch combos
   */
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoading(true);
        const response = await comboApi.getCombos({
          page: pagination.page,
          limit: pagination.limit,
        });
        setCombos(response.data.combos || []);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
        });
      } catch (error) {
        console.error('Error fetching combos:', error);
        showError('Không thể tải danh sách combo');
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, [pagination.page]);

  /**
   * Handle add combo to cart
   */
  const handleAddToCart = async (combo, e) => {
    e.stopPropagation(); // Prevent card click event
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
      <div className="combo-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="combo-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <Title level={2}>Combo Sách Ưu Đãi</Title>
          <Paragraph type="secondary">
            Mua combo tiết kiệm hơn - Giảm giá lên đến 50%
          </Paragraph>
        </div>

        {/* Combo List */}
        {combos.length === 0 ? (
          <Empty description="Chưa có combo nào" />
        ) : (
          <Row gutter={[24, 24]}>
            {combos.map((combo) => {
              const discount = combo.totalOriginalPrice - combo.comboPrice;
              const percent = Math.round((discount / combo.totalOriginalPrice) * 100);

              return (
                <Col key={combo._id} xs={24} sm={12} lg={8} xl={6}>
                  <Card
                    hoverable
                    className="combo-card"
                    onClick={() => navigate(`/combos/${combo._id}`)}
                    cover={
                      <div className="combo-image-wrapper">
                        <Image
                          src={combo.image}
                          alt={combo.name}
                          preview={false}
                          className="combo-image"
                        />
                        <div className="discount-badge">
                          <Tag color="red" style={{ fontSize: 16, padding: '4px 12px' }}>
                            -{percent}%
                          </Tag>
                        </div>
                      </div>
                    }
                  >
                    <div className="combo-content">
                      <Title level={4} ellipsis={{ rows: 2 }}>
                        {combo.name}
                      </Title>

                      <div className="combo-books">
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {combo.books.length} sách trong combo
                        </Text>
                        <div className="book-tags">
                          {combo.books.slice(0, 2).map((item, idx) => (
                            <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
                              {item.book?.title?.substring(0, 20)}
                              {item.book?.title?.length > 20 ? '...' : ''} (x{item.quantity})
                            </Tag>
                          ))}
                          {combo.books.length > 2 && (
                            <Tag style={{ marginBottom: 4 }}>
                              +{combo.books.length - 2} sách khác
                            </Tag>
                          )}
                        </div>
                      </div>

                      <div className="combo-price">
                        <div>
                          <Text delete type="secondary">
                            {formatPrice(combo.totalOriginalPrice)}
                          </Text>
                        </div>
                        <div>
                          <Text strong style={{ color: '#f5222d', fontSize: 20 }}>
                            {formatPrice(combo.comboPrice)}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Tiết kiệm {formatPrice(discount)}
                          </Text>
                        </div>
                      </div>

                      <div className="combo-actions">
                        <Button
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          onClick={(e) => handleAddToCart(combo, e)}
                          block
                          size="large"
                        >
                          Thêm vào giỏ
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page * pagination.limit >= pagination.total}
              size="large"
            >
              Xem thêm
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboPage;
