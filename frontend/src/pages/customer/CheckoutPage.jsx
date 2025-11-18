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
  Tag,
} from 'antd';
import {
  EnvironmentOutlined,
  PlusOutlined,
  HomeOutlined,
  ShopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { fetchCart } from '@redux/slices/cartSlice';
import { createOrder } from '@redux/slices/orderSlice';
import { formatPrice } from '@utils/formatPrice';
import { showSuccess, showError, showLoading } from '@utils/notification';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@constants/appConstants';
import { addressApi } from '@api';
import Loading from '@components/common/Loading';
import AddressSelector from '@components/address/AddressSelector';
import AddressForm from '@components/address/AddressForm';
import './CheckoutPage.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [hasAddresses, setHasAddresses] = useState(false);

  // Redux state
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  /**
   * Get location type display
   */
  const getLocationTypeDisplay = (type) => {
    const types = {
      home: { icon: <HomeOutlined />, text: 'Nhà ở' },
      office: { icon: <ShopOutlined />, text: 'Văn phòng' },
      other: { icon: <EnvironmentOutlined />, text: 'Khác' },
    };
    return types[type] || types.other;
  };

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
   * Fetch default address and set form values
   */
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        setLoadingAddress(true);

        // Lấy địa chỉ mặc định
        const response = await addressApi.getDefaultAddress();
        const defaultAddress = response.data.address;

        if (defaultAddress) {
          setHasAddresses(true);
          setSelectedAddress(defaultAddress);
          // Có địa chỉ mặc định, điền vào form
          form.setFieldsValue({
            recipientName: defaultAddress.recipientName,
            phone: defaultAddress.phone,
            province: defaultAddress.province,
            district: defaultAddress.district,
            ward: defaultAddress.ward,
            detailAddress: defaultAddress.detailAddress,
            paymentMethod: PAYMENT_METHODS.COD,
          });
        } else {
          // Kiểm tra xem có địa chỉ nào không
          const allAddressResponse = await addressApi.getMyAddresses();
          const addresses = allAddressResponse.data.addresses || [];

          if (addresses.length > 0) {
            setHasAddresses(true);
          } else {
            setHasAddresses(false);
          }

          // Không có địa chỉ mặc định, dùng thông tin user
          if (user) {
            form.setFieldsValue({
              recipientName: user.fullName,
              phone: user.phone,
              paymentMethod: PAYMENT_METHODS.COD,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching default address:', error);
        setHasAddresses(false);
        // Fallback to user info
        if (user) {
          form.setFieldsValue({
            recipientName: user.fullName,
            phone: user.phone,
            paymentMethod: PAYMENT_METHODS.COD,
          });
        }
      } finally {
        setLoadingAddress(false);
      }
    };

    if (user) {
      fetchDefaultAddress();
    }
  }, [user, form]);

  /**
   * Handle select address
   */
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    form.setFieldsValue({
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detailAddress: address.detailAddress,
    });
    setShowAddressSelector(false);
  };

  /**
   * Handle add address success
   */
  const handleAddAddressSuccess = (newAddress) => {
    setSelectedAddress(newAddress);
    setHasAddresses(true);
    form.setFieldsValue({
      recipientName: newAddress.recipientName,
      phone: newAddress.phone,
      province: newAddress.province,
      district: newAddress.district,
      ward: newAddress.ward,
      detailAddress: newAddress.detailAddress,
    });
    setShowAddressForm(false);
    showSuccess('Đã thêm địa chỉ mới');
  };

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
      // Kiểm tra giỏ hàng trước khi submit
      if (!items || items.length === 0) {
        showError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
        navigate('/cart');
        return;
      }

      setLoading(true);

      console.log('Submitting order with values:', values);
      console.log('Cart items:', items);

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

      console.log('Order data to send:', orderData);

      const result = await dispatch(createOrder(orderData)).unwrap();

      hide();
      showSuccess('Đặt hàng thành công!');

      // Redirect to order detail
      navigate(`/orders/${result.order._id}`);
    } catch (error) {
      console.error('Order error:', error);

      // Hiển thị lỗi chi tiết nếu có
      const errorMessage = typeof error === 'object' && error.errors
        ? error.errors.map(e => e.message).join(', ')
        : error || 'Đặt hàng thất bại. Vui lòng thử lại.';

      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0 || loadingAddress) {
    return <Loading fullScreen />;
  }

  return (
    <div className="checkout-page">
      <div className="page-content">
        <div className="container">
          <Title level={2} className="page-title">
            Thanh toán đơn hàng
          </Title>

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
                <Card className="checkout-section">
                  <div className="card-header">
                    <Title level={5} style={{ margin: 0 }}>Thông tin giao hàng</Title>
                    {hasAddresses && selectedAddress && (
                      <Button
                        type="link"
                        onClick={() => setShowAddressSelector(true)}
                      >
                        Chọn địa chỉ khác
                      </Button>
                    )}
                  </div>

                  {hasAddresses && selectedAddress ? (
                    <div className="selected-address-display">
                      <div className="address-info">
                        <div className="address-icon">
                          {getLocationTypeDisplay(selectedAddress.addressType)?.icon || <EnvironmentOutlined />}
                        </div>
                        <div className="address-content">
                          <div className="address-header">
                            <Space>
                              <Text strong style={{ fontSize: 16 }}>
                                {selectedAddress.recipientName}
                              </Text>
                              <Text type="secondary">|</Text>
                              <Text type="secondary">
                                {selectedAddress.phone}
                              </Text>
                              {selectedAddress.addressType && (
                                <Tag>{getLocationTypeDisplay(selectedAddress.addressType)?.text}</Tag>
                              )}
                              {selectedAddress.isDefault && (
                                <Tag icon={<CheckCircleOutlined />} color="success">
                                  Mặc định
                                </Tag>
                              )}
                            </Space>
                          </div>
                          <div className="address-detail">
                            <Text type="secondary">
                              {selectedAddress.detailAddress}
                            </Text>
                          </div>
                          <div className="address-location">
                            <Text type="secondary">
                              {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <EnvironmentOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">Bạn chưa có địa chỉ giao hàng</Text>
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setShowAddressForm(true)}
                      >
                        Thêm địa chỉ
                      </Button>
                    </div>
                  )}

                  {/* Hidden form fields to store address data */}
                  <div style={{ display: 'none' }}>
                    <Form.Item name="recipientName">
                      <Input />
                    </Form.Item>
                    <Form.Item name="phone">
                      <Input />
                    </Form.Item>
                    <Form.Item name="province">
                      <Input />
                    </Form.Item>
                    <Form.Item name="district">
                      <Input />
                    </Form.Item>
                    <Form.Item name="ward">
                      <Input />
                    </Form.Item>
                    <Form.Item name="detailAddress">
                      <Input />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="notes"
                    label="Ghi chú đơn hàng (không bắt buộc)"
                    style={{ marginTop: hasAddresses && selectedAddress ? 16 : 0 }}
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
                    block
                    loading={loading}
                    style={{ marginTop: 16 }}
                    onClick={() => {
                      if (!hasAddresses) {
                        setShowAddressForm(true);
                        showError('Vui lòng thêm địa chỉ giao hàng');
                      } else {
                        form.submit();
                      }
                    }}
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
      </div>

      {/* Address Selector Modal */}
      <AddressSelector
        visible={showAddressSelector}
        onCancel={() => setShowAddressSelector(false)}
        onSelect={handleSelectAddress}
        onAddNew={() => {
          setShowAddressSelector(false);
          setShowAddressForm(true);
        }}
        selectedAddressId={selectedAddress?._id}
      />

      {/* Address Form Modal */}
      <AddressForm
        visible={showAddressForm}
        onCancel={() => setShowAddressForm(false)}
        onSuccess={handleAddAddressSuccess}
      />
    </div>
  );
};

export default CheckoutPage;