/**
 * ==============================================
 * ORDER DETAIL PAGE
 * ==============================================
 * Trang chi tiết đơn hàng
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layout,
  Card,
  Row,
  Col,
  Steps,
  Descriptions,
  List,
  Button,
  Tag,
  Space,
  Typography,
  Modal,
  Input,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { fetchOrderById, cancelOrder } from '@redux/slices/orderSlice';
import { formatPrice } from '@utils/formatPrice';
import { formatDateTime } from '@utils/formatDate';
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
} from '@constants/appConstants';
import { showSuccess, showError } from '@utils/notification';
import Loading from '@components/common/Loading';
import './OrderDetailPage.scss';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Redux state
  const { currentOrder: order, loading } = useSelector((state) => state.order);

  /**
   * Fetch order detail
   */
  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [id, dispatch]);

  /**
   * Handle cancel order
   */
  const handleCancelOrder = async () => {
    if (!cancelReason || cancelReason.trim().length < 10) {
      showError('Vui lòng nhập lý do hủy (ít nhất 10 ký tự)');
      return;
    }

    try {
      setCancelling(true);

      await dispatch(
        cancelOrder({ id: order._id, cancelReason })
      ).unwrap();

      showSuccess('Đã hủy đơn hàng thành công');
      setCancelModalVisible(false);

      // Refresh order
      dispatch(fetchOrderById(id));
    } catch (error) {
      showError(error || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  /**
   * Get order status steps
   */
  const getOrderSteps = () => {
    const allSteps = [
      { title: 'Chờ xác nhận', status: ORDER_STATUS.PENDING },
      { title: 'Đã xác nhận', status: ORDER_STATUS.CONFIRMED },
      { title: 'Đang chuẩn bị', status: ORDER_STATUS.PREPARING },
      { title: 'Đang giao', status: ORDER_STATUS.SHIPPING },
      { title: 'Đã giao', status: ORDER_STATUS.DELIVERED },
    ];

    const statusIndex = allSteps.findIndex((s) => s.status === order?.status);

    return {
      steps: allSteps,
      current: statusIndex >= 0 ? statusIndex : 0,
    };
  };

  if (loading || !order) {
    return <Loading fullScreen />;
  }

  const { steps, current } = getOrderSteps();
  const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.status);

  return (
    <Layout className="order-detail-page">
      <Content className="page-content">
        <div className="container">
          {/* Back Button */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/orders')}
            style={{ marginBottom: 16 }}
          >
            Quay lại
          </Button>

          {/* Header */}
          <Card className="order-header-card">
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={3} style={{ margin: 0 }}>
                  Đơn hàng: {order.orderNumber}
                </Title>
                <Text type="secondary">
                  Đặt ngày: {formatDateTime(order.createdAt)}
                </Text>
              </Col>
              <Col>
                <Space>
                  <Tag color={ORDER_STATUS_COLORS[order.status]} style={{ fontSize: 16 }}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Tag>
                  {canCancel && (
                    <Button danger onClick={() => setCancelModalVisible(true)}>
                      Hủy đơn hàng
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Order Steps */}
          {order.status !== ORDER_STATUS.CANCELLED && (
            <Card style={{ marginBottom: 24 }}>
              <Steps current={current} items={steps} />
            </Card>
          )}

          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} md={16}>
              {/* Products */}
              <Card title="Sản phẩm đã đặt" style={{ marginBottom: 24 }}>
                <List
                  dataSource={order.items}
                  renderItem={(item) => {
                    const product = item.bookSnapshot || item.comboSnapshot;
                    return (
                      <List.Item className="order-item">
                        <Space align="start" style={{ width: '100%' }}>
                          <img
                            src={product.image}
                            alt={product.title || product.name}
                            className="item-image"
                          />
                          <div style={{ flex: 1 }}>
                            <Text strong>{product.title || product.name}</Text>
                            <div>
                              <Text type="secondary">x{item.quantity}</Text>
                            </div>
                            <Text className="item-price">
                              {formatPrice(item.price)}
                            </Text>
                          </div>
                          <Text strong style={{ color: '#ff4d4f' }}>
                            {formatPrice(item.price * item.quantity)}
                          </Text>
                        </Space>
                      </List.Item>
                    );
                  }}
                />
              </Card>

              {/* Shipping Address */}
              <Card title="Địa chỉ giao hàng">
                <Descriptions column={1}>
                  <Descriptions.Item label="Người nhận">
                    {order.shippingAddress.recipientName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {order.shippingAddress.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {order.shippingAddress.detailAddress}, {order.shippingAddress.ward},{' '}
                    {order.shippingAddress.district}, {order.shippingAddress.province}
                  </Descriptions.Item>
                  {order.notes && (
                    <Descriptions.Item label="Ghi chú">
                      {order.notes}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>

            {/* Right Column */}
            <Col xs={24} md={8}>
              {/* Order Summary */}
              <Card title="Tổng đơn hàng">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div className="summary-row">
                    <Text>Tạm tính:</Text>
                    <Text strong>{formatPrice(order.subtotal)}</Text>
                  </div>

                  <div className="summary-row">
                    <Text>Phí vận chuyển:</Text>
                    <Text strong>{formatPrice(order.shippingFee)}</Text>
                  </div>

                  {order.discount > 0 && (
                    <div className="summary-row">
                      <Text>Giảm giá:</Text>
                      <Text strong style={{ color: '#52c41a' }}>
                        -{formatPrice(order.discount)}
                      </Text>
                    </div>
                  )}

                  <div className="summary-row total">
                    <Text strong style={{ fontSize: 18 }}>
                      Tổng cộng:
                    </Text>
                    <Text strong style={{ fontSize: 20, color: '#ff4d4f' }}>
                      {formatPrice(order.totalPrice)}
                    </Text>
                  </div>
                </Space>
              </Card>

              {/* Payment Info */}
              <Card title="Thông tin thanh toán" style={{ marginTop: 24 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div className="info-row">
                    <Text type="secondary">Phương thức:</Text>
                    <Text strong>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</Text>
                  </div>
                  {/* Add payment status if needed */}
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Cancel Order Modal */}
      <Modal
        title="Hủy đơn hàng"
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        onOk={handleCancelOrder}
        confirmLoading={cancelling}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Text>Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng:</Text>
          <TextArea
            rows={4}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Nhập lý do hủy đơn (ít nhất 10 ký tự)..."
          />
        </Space>
      </Modal>
    </Layout>
  );
};

export default OrderDetailPage;