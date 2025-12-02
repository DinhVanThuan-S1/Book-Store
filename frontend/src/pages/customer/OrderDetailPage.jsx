/**
 * ==============================================
 * ORDER DETAIL PAGE
 * ==============================================
 * Trang chi tiết đơn hàng
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
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
  Rate,
  Upload,
  Form,
} from 'antd';
import { ArrowLeftOutlined, StarOutlined, RollbackOutlined, PlusOutlined } from '@ant-design/icons';
import { fetchOrderById, cancelOrder } from '@redux/slices/orderSlice';
import { orderApi, reviewApi, uploadApi } from '@api';
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

const { Title, Text } = Typography;
const { TextArea } = Input;

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Review modal state
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewableItems, setReviewableItems] = useState([]);
  const [selectedBookForReview, setSelectedBookForReview] = useState(null);
  const [reviewForm] = Form.useForm();
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Return modal state
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returning, setReturning] = useState(false);

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
   * Handle open review modal
   */
  const handleOpenReviewModal = async () => {
    try {
      const response = await orderApi.getReviewableItems(order._id);
      setReviewableItems(response.data.items);
      setReviewModalVisible(true);
    } catch (error) {
      showError('Không thể tải danh sách sách', error.message);
    }
  };

  /**
   * Handle submit review
   */
  const handleSubmitReview = async (values) => {
    if (!selectedBookForReview) {
      showError('Vui lòng chọn sách để đánh giá');
      return;
    }

    try {
      setUploadingImages(true);

      // Upload ảnh nếu có
      let imageUrls = [];
      if (fileList.length > 0) {
        const files = fileList
          .filter(file => file.originFileObj)
          .map(file => file.originFileObj);

        if (files.length > 0) {
          const uploadResponse = await uploadApi.uploadImages(files);
          console.log('Upload response:', uploadResponse);
          console.log('Upload response stringified:', JSON.stringify(uploadResponse, null, 2));

          // axiosInstance interceptor đã unwrap response.data
          // uploadResponse = { success: true, data: { images: [...] } }
          const images = uploadResponse.data?.images || [];
          console.log('images array:', images);
          console.log('images stringified:', JSON.stringify(images, null, 2));
          imageUrls = images.map(img => img.url);
          console.log('Extracted image URLs:', imageUrls);
        }
      }

      // Prepare review data
      const reviewData = {
        bookId: selectedBookForReview,
        orderId: order._id,
        rating: values.rating,
        title: values.title || '',
        comment: values.comment || '',
        images: imageUrls,
      };

      console.log('Sending review data:', reviewData);
      console.log('Images in reviewData:', reviewData.images);

      // Gửi review với ảnh đã upload
      await reviewApi.createReview(reviewData);

      showSuccess('Đánh giá thành công!');
      setReviewModalVisible(false);
      setSelectedBookForReview(null);
      setFileList([]);
      reviewForm.resetFields();

      // Refresh reviewable items
      handleOpenReviewModal();
    } catch (error) {
      console.error('Review error:', error);
      showError(error.message || 'Không thể gửi đánh giá');
    } finally {
      setUploadingImages(false);
    }
  };

  /**
   * Handle request return
   */
  const handleRequestReturn = async () => {
    if (!returnReason || returnReason.trim().length < 10) {
      showError('Vui lòng nhập lý do hoàn trả (ít nhất 10 ký tự)');
      return;
    }

    try {
      setReturning(true);

      await orderApi.requestReturn(order._id, returnReason);

      showSuccess('Yêu cầu hoàn trả đã được gửi. Vui lòng chờ xác nhận từ Admin.');
      setReturnModalVisible(false);
      setReturnReason('');

      // Refresh order
      dispatch(fetchOrderById(id));
    } catch (error) {
      showError(error.message || 'Không thể gửi yêu cầu hoàn trả');
    } finally {
      setReturning(false);
    }
  };

  /**
   * Handle upload change
   */
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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
    <div className="order-detail-page">
      <div className="page-content">
        <div className="container">
          {/* Back Button */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/orders', { state: { activeTab: location.state?.activeTab } })}
            style={{ marginBottom: 16 }}
          >
            Quay lại
          </Button>

          {/* Header */}
          <Card className="order-header-card">
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size="small">
                  <Title level={3} style={{ margin: 0 }}>
                    Mã đơn: {order.orderNumber}
                  </Title>
                  <Text type="secondary">
                    Đặt ngày: {formatDateTime(order.createdAt)}
                  </Text>
                </Space>
              </Col>
              <Col>
                <Space size="middle" align="center">
                  <Space direction="vertical" size="small" align="center">
                    <Tag className="order-status-tag" color={ORDER_STATUS_COLORS[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Tag>
                    {/* ✅ Hiển thị thông báo chờ xác nhận hoàn trả */}
                    {order.returnRequestedAt && order.status === ORDER_STATUS.DELIVERED && (
                      <Tag color="orange" style={{ fontSize: 12 }}>
                        ⚠️ Đã yêu cầu hoàn trả
                      </Tag>
                    )}
                  </Space>

                  <Space>
                    {order.status === ORDER_STATUS.DELIVERED && (
                      <>
                        <Button
                          type="primary"
                          icon={<StarOutlined />}
                          onClick={handleOpenReviewModal}
                          disabled={order.returnRequestedAt} // ✅ Disable nếu đã yêu cầu hoàn trả
                        >
                          Đánh giá
                        </Button>
                        <Button
                          icon={<RollbackOutlined />}
                          onClick={() => setReturnModalVisible(true)}
                          disabled={order.returnRequestedAt} // ✅ Disable nếu đã yêu cầu hoàn trả
                        >
                          Hoàn trả
                        </Button>
                      </>
                    )}
                    {canCancel && (
                      <Button danger onClick={() => setCancelModalVisible(true)}>
                        Hủy đơn hàng
                      </Button>
                    )}
                  </Space>
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

              {/* Cancel Reason */}
              {order.status === ORDER_STATUS.CANCELLED && order.cancelReason && (
                <Card title="Lý do hủy" style={{ marginTop: 24 }}>
                  <Text>{order.cancelReason}</Text>
                </Card>
              )}

              {/* Return Reason */}
              {order.status === ORDER_STATUS.RETURNED && order.returnReason && (
                <Card title="Lý do hoàn trả" style={{ marginTop: 24 }}>
                  <Text>{order.returnReason}</Text>
                </Card>
              )}
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

                  {order.payment && (
                    <>
                      {order.payment.status && (
                        <div className="info-row">
                          <Text type="secondary">Trạng thái:</Text>
                          <Tag
                            color={order.payment.status === 'paid' ? 'success' :
                              order.payment.status === 'pending' ? 'warning' :
                                order.payment.status === 'refunded' ? 'purple' : 'default'}
                          >
                            {order.payment.status === 'paid' ? 'Đã thanh toán' :
                              order.payment.status === 'pending' ? 'Chờ thanh toán' :
                                order.payment.status === 'refunded' ? 'Đã hoàn tiền' : 'Thất bại'}
                          </Tag>
                        </div>
                      )}

                      {order.payment.transactionId && (
                        <div className="info-row">
                          <Text type="secondary">Mã GD:</Text>
                          <Text code style={{ fontSize: 12 }}>{order.payment.transactionId}</Text>
                        </div>
                      )}

                      {/* Bank Transfer */}
                      {(order.paymentMethod === 'bank_transfer' || order.payment.paymentMethod === 'bank_transfer') && (
                        <>
                          {order.payment.bankCode && (
                            <div className="info-row">
                              <Text type="secondary">Ngân hàng:</Text>
                              <Text>{order.payment.bankCode}</Text>
                            </div>
                          )}
                          {order.payment.accountNumber && (
                            <div className="info-row">
                              <Text type="secondary">Số TK:</Text>
                              <Text>{order.payment.accountNumber}</Text>
                            </div>
                          )}
                          {order.payment.accountName && (
                            <div className="info-row">
                              <Text type="secondary">Chủ TK:</Text>
                              <Text>{order.payment.accountName}</Text>
                            </div>
                          )}
                        </>
                      )}

                      {/* MoMo / ZaloPay */}
                      {((order.paymentMethod === 'momo' || order.paymentMethod === 'zalopay') ||
                        (order.payment.paymentMethod === 'momo' || order.payment.paymentMethod === 'zalopay')) && (
                          <>
                            {order.payment.walletPhone && (
                              <div className="info-row">
                                <Text type="secondary">SĐT:</Text>
                                <Text>{order.payment.walletPhone}</Text>
                              </div>
                            )}
                          </>
                        )}

                      {/* Credit Card */}
                      {(order.paymentMethod === 'credit_card' || order.payment.paymentMethod === 'credit_card') && (
                        <>
                          {order.payment.cardNumber && (
                            <div className="info-row">
                              <Text type="secondary">Số thẻ:</Text>
                              <Text>{order.payment.cardNumber}</Text>
                            </div>
                          )}
                          {order.payment.cardExpiry && (
                            <div className="info-row">
                              <Text type="secondary">Hạn thẻ:</Text>
                              <Text>{order.payment.cardExpiry}</Text>
                            </div>
                          )}
                          {order.payment.cardName && (
                            <div className="info-row">
                              <Text type="secondary">Tên thẻ:</Text>
                              <Text>{order.payment.cardName}</Text>
                            </div>
                          )}
                        </>
                      )}

                      {order.payment.paidAt && (
                        <div className="info-row">
                          <Text type="secondary">Thanh toán lúc:</Text>
                          <Text style={{ fontSize: 12 }}>{formatDateTime(order.payment.paidAt)}</Text>
                        </div>
                      )}
                    </>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

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

      {/* Review Modal */}
      <Modal
        title="Đánh giá sản phẩm"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          setSelectedBookForReview(null);
          setFileList([]);
          reviewForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        {reviewableItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">Bạn đã đánh giá tất cả sản phẩm trong đơn hàng này</Text>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <Text strong>Chọn sản phẩm để đánh giá:</Text>
              <div style={{ marginTop: 16 }}>
                {reviewableItems.map((item) => (
                  <Card
                    key={item._id}
                    hoverable
                    style={{
                      marginBottom: 12,
                      border: selectedBookForReview === item.book._id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: item.isReviewed ? 'not-allowed' : 'pointer',
                      opacity: item.isReviewed ? 0.5 : 1,
                    }}
                    onClick={() => !item.isReviewed && setSelectedBookForReview(item.book._id)}
                  >
                    <Row gutter={16} align="middle">
                      <Col>
                        <img
                          src={item.book.images?.[0] || item.bookSnapshot?.image}
                          alt={item.book.title || item.bookSnapshot?.title}
                          style={{ width: 60, height: 80, objectFit: 'cover' }}
                        />
                      </Col>
                      <Col flex="auto">
                        <div><strong>{item.book.title || item.bookSnapshot?.title}</strong></div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {item.book.author?.name || item.bookSnapshot?.author}
                        </div>
                      </Col>
                      <Col>
                        {item.isReviewed && (
                          <Tag color="green">Đã đánh giá</Tag>
                        )}
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </div>

            {selectedBookForReview && (
              <Form
                form={reviewForm}
                layout="vertical"
                onFinish={handleSubmitReview}
              >
                <Form.Item
                  name="rating"
                  label="Đánh giá"
                  rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
                >
                  <Rate />
                </Form.Item>

                <Form.Item
                  name="title"
                  label="Tiêu đề (tùy chọn)"
                >
                  <Input placeholder="Tóm tắt cảm nhận của bạn..." />
                </Form.Item>

                <Form.Item
                  name="comment"
                  label="Nhận xét (tùy chọn)"
                >
                  <TextArea
                    rows={4}
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                    maxLength={1000}
                    showCount
                  />
                </Form.Item>

                <Form.Item label="Hình ảnh (tùy chọn)">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    maxCount={5}
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    {fileList.length >= 5 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={uploadingImages}
                    >
                      {uploadingImages ? 'Đang tải ảnh...' : 'Gửi đánh giá'}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedBookForReview(null);
                        setFileList([]);
                        reviewForm.resetFields();
                      }}
                      disabled={uploadingImages}
                    >
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}
          </>
        )}
      </Modal>

      {/* Return Request Modal */}
      <Modal
        title="Yêu cầu hoàn trả"
        open={returnModalVisible}
        onCancel={() => setReturnModalVisible(false)}
        onOk={handleRequestReturn}
        confirmLoading={returning}
        okText="Gửi yêu cầu"
        cancelText="Đóng"
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Text>Vui lòng cho chúng tôi biết lý do bạn muốn hoàn trả:</Text>
          <TextArea
            rows={4}
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Nhập lý do hoàn trả (ít nhất 10 ký tự)..."
            maxLength={500}
            showCount
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            * Admin sẽ xem xét và phản hồi yêu cầu của bạn trong thời gian sớm nhất.
          </Text>
        </Space>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;