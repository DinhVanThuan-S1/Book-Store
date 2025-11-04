/**
 * ==============================================
 * CHECKOUT PAGE
 * ==============================================
 * Trang thanh toán đơn hàng
 * Author: DinhVanThuan-S1
 * Date: 2025-11-04
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layout,
  Row,
  Col,
  Card,
  Form,
  Input,
  Radio,
  Button,
  Steps,
  Divider,
  List,
  Typography,
  Space,
} from 'antd';
import {
  EnvironmentOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { fetchCart } from '@redux/slices/cartSlice';
import { createOrder } from '@redux/slices/orderSlice';
import { formatPrice } from '@utils/formatPrice';
import { showSuccess, showError, showLoading } from '@utils/notification';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@constants/appConstants';
import Loading from '@components/common/Loading';
import './CheckoutPage.scss';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Redux state
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  /**
   * Fetch cart
   */
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  /**
   * Redirect nếu giỏ hàng trống
   */
  useEffect(() => {
    if (!items || items.length === 0) {
      showError('Giỏ hàng trống');
      navigate('/cart');
    }
  }, [items, navigate]);

  /**
   * Set default values
   */
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        recipientName: user.fullName,
        phone: user.phone,
        paymentMethod: PAYMENT_METHODS.COD,
      });
    }
  }, [user, form]);

  /**
   * Calculate total
   */
  const shippingFee = totalPrice >= 300000 ? 0 : 25000;
  const total = totalPrice + shippingFee;

  /**
   * Handle submit order
   */
  const handleSubmitOrder = async (values) => {
    try {
      setLoading(true);
      const hide = showLoading('Đang xử lý đơn hàng...');

      const orderData = {
        shippingAddress: {
          recipientName: values.recipientName,
          phone: values.phone,
          province: values.province,
          district: values.district,
          ward: values.ward,
          detailAddress: values.detailAddress,
        },
        paymentMethod: values.paymentMethod,
        notes: values.notes || '',
      };

      const result = await dispatch(createOrder(orderData)).unwrap();

      hide();
      showSuccess('Đặt hàng thành công!');

      // Redirect to order detail
      navigate(`/orders/${result.order._id}`);
    } catch (error) {
      showError(error || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Steps
   */
  const steps = [
    {
      title: 'Địa chỉ giao hàng',
      icon: <EnvironmentOutlined />,
    },
    {
      title: 'Thanh toán',
      icon: <CreditCardOutlined />,
    },
    {
      title: 'Hoàn tất',
      icon: <CheckCircleOutlined />,
    },
  ];

  if (!items || items.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <Layout className="checkout-page">
      <Content className="page-content">
        <div className="container">
          <Title level={2} className="page-title">
            Thanh toán đơn hàng
          </Title>

          {/* Steps */}
          <Steps current={currentStep} items={steps} className="checkout-steps" />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitOrder}
            scrollToFirstError
          >
            <Row gutter={24}>
              {/* Left Column - Form */}
              <Col xs={24} md={16}>
                {/* Shipping Address */}
                <Card
                  title="Thông tin giao hàng"
                  className="checkout-section"
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="recipientName"
                        label="Tên người nhận"
                        rules={[
                          { required: true, message: 'Vui lòng nhập tên người nhận!' },
                        ]}
                      >
                        <Input placeholder="Nguyễn Văn A" size="large" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                          { required: true, message: 'Vui lòng nhập số điện thoại!' },
                          {
                            pattern: /^[0-9]{10,11}$/,
                            message: 'Số điện thoại không hợp lệ!',
                          },
                        ]}
                      >
                        <Input placeholder="0912345678" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="province"
                        label="Tỉnh/Thành phố"
                        rules={[
                          { required: true, message: 'Vui lòng chọn tỉnh/thành phố!' },
                        ]}
                      >
                        <Input placeholder="TP. Hồ Chí Minh" size="large" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="district"
                        label="Quận/Huyện"
                        rules={[
                          { required: true, message: 'Vui lòng chọn quận/huyện!' },
                        ]}
                      >
                        <Input placeholder="Quận 1" size="large" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="ward"
                        label="Phường/Xã"
                        rules={[
                          { required: true, message: 'Vui lòng chọn phường/xã!' },
                        ]}
                      >
                        <Input placeholder="Phường Bến Nghé" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="detailAddress"
                    label="Địa chỉ chi tiết"
                    rules={[
                      { required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' },
                    ]}
                  >
                    <Input placeholder="Số nhà, tên đường..." size="large" />
                  </Form.Item>

                  <Form.Item
                    name="notes"
                    label="Ghi chú đơn hàng (không bắt buộc)"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Ghi chú thêm (ví dụ: giao ngoài giờ hành chính...)"
                    />
                  </Form.Item>
                </Card>

                {/* Payment Method */}
                <Card
                  title="Phương thức thanh toán"
                  className="checkout-section"
                >
                  <Form.Item
                    name="paymentMethod"
                    rules={[
                      { required: true, message: 'Vui lòng chọn phương thức thanh toán!' },
                    ]}
                  >
                    <Radio.Group className="payment-methods">
                      {Object.values(PAYMENT_METHODS).map((method) => (
                        <Radio key={method} value={method} className="payment-method-item">
                          {PAYMENT_METHOD_LABELS[method]}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                </Card>
              </Col>

              {/* Right Column - Order Summary */}
              <Col xs={24} md={8}>
                <Card title="Đơn hàng của bạn" className="order-summary">
                  {/* Products */}
                  <List
                    dataSource={items}
                    renderItem={(item) => {
                      const product = item.type === 'book' ? item.book : item.combo;
                      return (
                        <List.Item className="order-item">
                          <Space align="start" style={{ width: '100%' }}>
                            <img
                              src={
                                item.type === 'book'
                                  ? product.images?.[0]
                                  : product.image
                              }
                              alt={product.title || product.name}
                              className="order-item-image"
                            />
                            <div className="order-item-info">
                              <Text strong>{product.title || product.name}</Text>
                              <div>
                                <Text type="secondary">
                                  {formatPrice(item.price)} x {item.quantity}
                                </Text>
                              </div>
                              <Text className="item-subtotal">
                                {formatPrice(item.price * item.quantity)}
                              </Text>
                            </div>
                          </Space>
                        </List.Item>
                      );
                    }}
                  />

                  <Divider />

                  {/* Summary */}
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div className="summary-row">
                      <Text>Tạm tính:</Text>
                      <Text strong>{formatPrice(totalPrice)}</Text>
                    </div>

                    <div className="summary-row">
                      <Text>Phí vận chuyển:</Text>
                      <Text strong>{formatPrice(shippingFee)}</Text>
                    </div>

                    {shippingFee === 0 && (
                      <Text type="success" style={{ fontSize: 12 }}>
                        ✓ Miễn phí vận chuyển
                      </Text>
                    )}

                    <Divider style={{ margin: '8px 0' }} />

                    <div className="summary-row total">
                      <Text strong style={{ fontSize: 18 }}>
                        Tổng cộng:
                      </Text>
                      <Text strong style={{ fontSize: 20, color: '#ff4d4f' }}>
                        {formatPrice(total)}
                      </Text>
                    </div>
                  </Space>

                  {/* Submit Button */}
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    block
                    loading={loading}
                    style={{ marginTop: 16 }}
                  >
                    Đặt hàng
                  </Button>

                  <Text
                    type="secondary"
                    style={{ fontSize: 12, display: 'block', marginTop: 8, textAlign: 'center' }}
                  >
                    Bằng việc đặt hàng, bạn đồng ý với{' '}
                    <a href="/terms">Điều khoản sử dụng</a>
                  </Text>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default CheckoutPage;