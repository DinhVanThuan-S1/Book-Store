/**
 * ==============================================
 * ORDER HISTORY PAGE
 * ==============================================
 * Trang lịch sử đơn hàng
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layout,
  Card,
  Tabs,
  List,
  Button,
  Tag,
  Space,
  Typography,
  Empty,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { fetchMyOrders } from '@redux/slices/orderSlice';
import { formatPrice } from '@utils/formatPrice';
import { formatDate } from '@utils/formatDate';
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@constants/appConstants';
import Loading from '@components/common/Loading';
import './OrderHistoryPage.scss';

const { Content } = Layout;
const { Title, Text } = Typography;

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('all');

  // Redux state
  const { orders, loading } = useSelector((state) => state.order);

  /**
   * Fetch orders
   */
  useEffect(() => {
    const params = {};
    if (activeTab !== 'all') {
      params.status = activeTab;
    }

    dispatch(fetchMyOrders(params));
  }, [activeTab, dispatch]);

  /**
   * Tabs items
   */
  const tabItems = [
    { key: 'all', label: 'Tất cả' },
    { key: ORDER_STATUS.PENDING, label: ORDER_STATUS_LABELS[ORDER_STATUS.PENDING] },
    { key: ORDER_STATUS.CONFIRMED, label: ORDER_STATUS_LABELS[ORDER_STATUS.CONFIRMED] },
    { key: ORDER_STATUS.SHIPPING, label: ORDER_STATUS_LABELS[ORDER_STATUS.SHIPPING] },
    { key: ORDER_STATUS.DELIVERED, label: ORDER_STATUS_LABELS[ORDER_STATUS.DELIVERED] },
    { key: ORDER_STATUS.CANCELLED, label: ORDER_STATUS_LABELS[ORDER_STATUS.CANCELLED] },
  ];

  /**
   * Render order item
   */
  const renderOrderItem = (order) => {
    return (
      <Card className="order-card" key={order._id}>
        <div className="order-header">
          <Space>
            <Text strong>Đơn hàng: {order.orderNumber}</Text>
            <Tag color={ORDER_STATUS_COLORS[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Tag>
          </Space>
          <Text type="secondary">{formatDate(order.createdAt)}</Text>
        </div>

        <div className="order-items">
          {order.items.slice(0, 3).map((item, index) => {
            const product = item.bookSnapshot || item.comboSnapshot;
            return (
              <div key={index} className="order-item">
                <img
                  src={product.image}
                  alt={product.title || product.name}
                  className="item-image"
                />
                <div className="item-info">
                  <Text>{product.title || product.name}</Text>
                  <Text type="secondary">x{item.quantity}</Text>
                </div>
              </div>
            );
          })}
          {order.items.length > 3 && (
            <Text type="secondary">+{order.items.length - 3} sản phẩm khác</Text>
          )}
        </div>

        <div className="order-footer">
          <div className="order-total">
            <Text type="secondary">Tổng tiền:</Text>
            <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
              {formatPrice(order.totalPrice)}
            </Text>
          </div>

          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/orders/${order._id}`)}
          >
            Xem chi tiết
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <Layout className="order-history-page">
      <Content className="page-content">
        <div className="container">
          <Title level={2} className="page-title">
            Đơn hàng của tôi
          </Title>

          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />

            {loading ? (
              <Loading />
            ) : orders && orders.length > 0 ? (
              <List
                dataSource={orders}
                renderItem={renderOrderItem}
                locale={{ emptyText: 'Không có đơn hàng nào' }}
              />
            ) : (
              <Empty
                description="Bạn chưa có đơn hàng nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/books')}>
                  Tiếp tục mua sắm
                </Button>
              </Empty>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default OrderHistoryPage;