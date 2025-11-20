/**
 * ==============================================
 * ORDER MANAGEMENT PAGE (Admin)
 * ==============================================
 * Quản lý đơn hàng cho admin
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  Typography,
  Descriptions,
  Dropdown,
  Menu,
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { orderApi } from '@api';
import { formatPrice } from '@utils/formatPrice';
import { formatDate } from '@utils/formatDate';
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
} from '@constants/appConstants';
import { showSuccess, showError } from '@utils/notification';
import Loading from '@components/common/Loading';
import './OrderManagementPage.scss';

const { Title, Text } = Typography;
const { Search } = Input;

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: null,
  });

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);

  /**
   * Fetch orders
   */
  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await orderApi.getAllOrders(params);

      setOrders(response.data.orders);
      setPagination(prev => ({
        ...prev,
        current: response.data.pagination.page,
        total: response.data.pagination.total,
      }));
    } catch (err) {
      console.error('Error fetching orders:', err);
      showError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /**
   * Handle search
   */
  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
  };

  /**
   * Handle status filter
   */
  const handleStatusChange = (value) => {
    setFilters({ ...filters, status: value });
  };

  /**
   * Handle table change
   */
  const handleTableChange = (newPagination) => {
    fetchOrders(newPagination.current);
  };

  /**
   * Handle view order detail
   */
  const handleViewDetail = async (orderId) => {
    try {
      const response = await orderApi.getOrderById(orderId);

      // Axios interceptor đã unwrap response.data
      // Backend trả về: { success: true, data: { order, payment } }
      // Sau interceptor: response = { success: true, data: { order, payment } }
      const orderData = response.data?.order || response.order;
      const paymentData = response.data?.payment || response.payment;

      // Gắn payment vào order để dễ truy cập
      const orderWithPayment = {
        ...orderData,
        payment: paymentData,
      };

      setSelectedOrder(orderWithPayment);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Error loading order detail:', error);
      showError('Không thể tải chi tiết đơn hàng');
    }
  };

  /**
   * Handle update status
   */
  const handleUpdateStatus = async (orderId, newStatus) => {
    // Nếu là hủy đơn, yêu cầu nhập lý do
    if (newStatus === ORDER_STATUS.CANCELLED) {
      setOrderToCancel(orderId);
      setCancelModalVisible(true);
      return;
    }

    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      showSuccess('Đã cập nhật trạng thái đơn hàng');
      fetchOrders(pagination.current);

      // Nếu đang xem chi tiết, đóng modal
      if (detailModalVisible) {
        setDetailModalVisible(false);
      }
    } catch (error) {
      showError(error.message || 'Không thể cập nhật trạng thái');
    }
  };

  /**
   * Handle confirm cancel order
   */
  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      showError('Vui lòng nhập lý do hủy đơn');
      return;
    }

    if (cancelReason.trim().length < 10) {
      showError('Lý do hủy phải có ít nhất 10 ký tự');
      return;
    }

    try {
      await orderApi.updateOrderStatus(orderToCancel, ORDER_STATUS.CANCELLED, cancelReason);
      showSuccess('Đã hủy đơn hàng');
      fetchOrders(pagination.current);

      // Reset và đóng modal
      setCancelModalVisible(false);
      setCancelReason('');
      setOrderToCancel(null);

      if (detailModalVisible) {
        setDetailModalVisible(false);
      }
    } catch (error) {
      showError(error.message || 'Không thể hủy đơn hàng');
    }
  };

  /**
   * Handle confirm return
   */
  const handleConfirmReturn = async (orderId) => {
    try {
      await orderApi.confirmReturn(orderId);
      showSuccess('Đã xác nhận hoàn trả đơn hàng');
      fetchOrders(pagination.current);

      if (detailModalVisible) {
        setDetailModalVisible(false);
      }
    } catch (error) {
      showError(error.message || 'Không thể xác nhận hoàn trả');
    }
  };

  /**
   * Get next possible statuses
   */
  const getNextStatuses = (currentStatus) => {
    const statusFlow = {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING],
      [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
      [ORDER_STATUS.DELIVERED]: [], // ✅ Không có nút chuyển, customer yêu cầu hoàn trả
      [ORDER_STATUS.CANCELLED]: [],
      [ORDER_STATUS.RETURNED]: [],
    };

    return statusFlow[currentStatus] || [];
  };

  /**
   * Render status dropdown
   */
  const renderStatusDropdown = (record) => {
    const nextStatuses = getNextStatuses(record.status);

    if (nextStatuses.length === 0) {
      return null;
    }

    const menu = (
      <Menu
        onClick={({ key }) => handleUpdateStatus(record._id, key)}
        items={nextStatuses.map(status => ({
          key: status,
          label: (
            <Space>
              <Tag color={ORDER_STATUS_COLORS[status]}>
                {ORDER_STATUS_LABELS[status]}
              </Tag>
            </Space>
          ),
        }))}
      />
    );

    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button size="small">
          Chuyển trạng thái <DownOutlined />
        </Button>
      </Dropdown>
    );
  };

  /**
   * Table columns
   */
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        <div>
          <div>{customer?.fullName}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {customer?.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => (
        <span style={{ color: '#f5222d', fontWeight: 600 }}>
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: 'Thanh toán',
      key: 'payment',
      render: (_, record) => {
        // Lấy payment từ relationship hoặc trực tiếp từ order
        const paymentMethod = record.paymentMethod || record.payment?.paymentMethod;
        const paymentStatus = record.payment?.status;

        return (
          <div>
            <div>{PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}</div>
            {paymentStatus && (
              <Tag
                color={paymentStatus === 'paid' ? 'success' : paymentStatus === 'pending' ? 'warning' : 'default'}
                style={{ fontSize: 10, marginTop: 4 }}
              >
                {paymentStatus === 'paid' ? 'Đã thanh toán' :
                  paymentStatus === 'pending' ? 'Chờ thanh toán' :
                    paymentStatus === 'failed' ? 'Thất bại' : 'Hoàn tiền'}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space direction="vertical" size="small">
          <Tag color={ORDER_STATUS_COLORS[status]}>
            {ORDER_STATUS_LABELS[status]}
          </Tag>
          {/* ✅ Hiển thị badge nếu có yêu cầu hoàn trả */}
          {record.returnRequestedAt && status === ORDER_STATUS.DELIVERED && (
            <Tag color="orange" style={{ fontSize: 11 }}>
              ⚠️ Chờ xác nhận hoàn trả
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record._id)}
          >
            Xem
          </Button>
          {/* ✅ Nút xác nhận hoàn trả nếu có yêu cầu */}
          {record.returnRequestedAt && record.status === ORDER_STATUS.DELIVERED && (
            <Button
              type="primary"
              size="small"
              danger
              onClick={() => handleConfirmReturn(record._id)}
            >
              Xác nhận hoàn trả
            </Button>
          )}
          {renderStatusDropdown(record)}
        </Space>
      ),
    },
  ];

  return (
    <div className="order-management-page">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2}>Quản lý đơn hàng</Title>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <Space size="middle">
          <Search
            placeholder="Tìm kiếm đơn hàng..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />

          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            onChange={handleStatusChange}
            style={{ width: 200 }}
            options={[
              { value: null, label: 'Tất cả trạng thái' },
              ...Object.keys(ORDER_STATUS).map((key) => ({
                value: ORDER_STATUS[key],
                label: ORDER_STATUS_LABELS[ORDER_STATUS[key]],
              })),
            ]}
          />
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng - ${selectedOrder?.orderNumber}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={
          <Space>
            <Button onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>
            {/* ✅ Nút xác nhận hoàn trả */}
            {selectedOrder?.returnRequestedAt && selectedOrder?.status === ORDER_STATUS.DELIVERED && (
              <Button
                type="primary"
                danger
                onClick={() => handleConfirmReturn(selectedOrder._id)}
              >
                Xác nhận hoàn trả
              </Button>
            )}
            {selectedOrder && getNextStatuses(selectedOrder.status).length > 0 && (
              <Dropdown
                overlay={
                  <Menu
                    onClick={({ key }) => handleUpdateStatus(selectedOrder._id, key)}
                    items={getNextStatuses(selectedOrder.status).map(status => ({
                      key: status,
                      label: (
                        <Space>
                          <Tag color={ORDER_STATUS_COLORS[status]}>
                            {ORDER_STATUS_LABELS[status]}
                          </Tag>
                        </Space>
                      ),
                    }))}
                  />
                }
                trigger={['click']}
              >
                <Button type="primary">
                  Chuyển trạng thái <DownOutlined />
                </Button>
              </Dropdown>
            )}
          </Space>
        }
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Khách hàng" span={2}>
                {selectedOrder.customer?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.shippingAddress?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Space direction="vertical" size="small">
                  <Tag color={ORDER_STATUS_COLORS[selectedOrder.status]}>
                    {ORDER_STATUS_LABELS[selectedOrder.status]}
                  </Tag>
                  {selectedOrder.cancelReason && (
                    <div style={{ color: '#ff4d4f', fontSize: 12 }}>
                      <strong>Lý do hủy:</strong> {selectedOrder.cancelReason}
                    </div>
                  )}
                  {selectedOrder.returnReason && (
                    <div style={{ color: '#fa8c16', fontSize: 12 }}>
                      <strong>Lý do hoàn trả:</strong> {selectedOrder.returnReason}
                    </div>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {`${selectedOrder.shippingAddress?.detailAddress}, ${selectedOrder.shippingAddress?.ward}, ${selectedOrder.shippingAddress?.district}, ${selectedOrder.shippingAddress?.province}`}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                <Space direction="vertical" size="small">
                  <div>{PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod]}</div>
                  {selectedOrder.payment?.status && (
                    <Tag
                      color={selectedOrder.payment.status === 'paid' ? 'success' :
                        selectedOrder.payment.status === 'pending' ? 'warning' : 'default'}
                    >
                      {selectedOrder.payment.status === 'paid' ? 'Đã thanh toán' :
                        selectedOrder.payment.status === 'pending' ? 'Chờ thanh toán' :
                          selectedOrder.payment.status === 'failed' ? 'Thất bại' : 'Hoàn tiền'}
                    </Tag>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                  {formatPrice(selectedOrder.totalPrice)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            {/* Thông tin thanh toán chi tiết */}
            {selectedOrder.payment && (selectedOrder.paymentMethod || selectedOrder.payment.paymentMethod) !== 'COD' && (
              <>
                <Title level={5} style={{ marginTop: 24 }}>
                  Thông tin thanh toán
                </Title>
                <Descriptions bordered column={2} size="small">
                  {selectedOrder.payment.transactionId && (
                    <Descriptions.Item label="Mã giao dịch" span={2}>
                      <Text code>{selectedOrder.payment.transactionId}</Text>
                    </Descriptions.Item>
                  )}

                  {/* Lấy paymentMethod từ order hoặc payment */}
                  {(selectedOrder.paymentMethod === 'bank_transfer' || selectedOrder.payment.paymentMethod === 'bank_transfer') && (
                    <>
                      {selectedOrder.payment.bankCode && (
                        <Descriptions.Item label="Ngân hàng">
                          {selectedOrder.payment.bankCode}
                        </Descriptions.Item>
                      )}
                      {selectedOrder.payment.accountNumber && (
                        <Descriptions.Item label="Số tài khoản">
                          {selectedOrder.payment.accountNumber}
                        </Descriptions.Item>
                      )}
                      {selectedOrder.payment.accountName && (
                        <Descriptions.Item label="Chủ tài khoản" span={2}>
                          {selectedOrder.payment.accountName}
                        </Descriptions.Item>
                      )}
                    </>
                  )}

                  {((selectedOrder.paymentMethod === 'momo' || selectedOrder.paymentMethod === 'zalopay') ||
                    (selectedOrder.payment.paymentMethod === 'momo' || selectedOrder.payment.paymentMethod === 'zalopay')) && (
                      <>
                        {selectedOrder.payment.walletPhone && (
                          <Descriptions.Item label="Số điện thoại" span={2}>
                            {selectedOrder.payment.walletPhone}
                          </Descriptions.Item>
                        )}
                      </>
                    )}

                  {(selectedOrder.paymentMethod === 'credit_card' || selectedOrder.payment.paymentMethod === 'credit_card') && (
                    <>
                      {selectedOrder.payment.cardNumber && (
                        <Descriptions.Item label="Số thẻ">
                          {selectedOrder.payment.cardNumber}
                        </Descriptions.Item>
                      )}
                      {selectedOrder.payment.cardExpiry && (
                        <Descriptions.Item label="Hạn thẻ">
                          {selectedOrder.payment.cardExpiry}
                        </Descriptions.Item>
                      )}
                      {selectedOrder.payment.cardName && (
                        <Descriptions.Item label="Tên trên thẻ" span={2}>
                          {selectedOrder.payment.cardName}
                        </Descriptions.Item>
                      )}
                    </>
                  )}

                  {selectedOrder.payment.paidAt && (
                    <Descriptions.Item label="Thời gian thanh toán" span={2}>
                      {formatDate(selectedOrder.payment.paidAt)}
                    </Descriptions.Item>
                  )}

                  {selectedOrder.payment.notes && (
                    <Descriptions.Item label="Ghi chú" span={2}>
                      <Text type="secondary">{selectedOrder.payment.notes}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}            <Title level={5} style={{ marginTop: 24 }}>
              Sản phẩm
            </Title>
            <Table
              dataSource={selectedOrder.items}
              columns={[
                {
                  title: 'Sản phẩm',
                  render: (_, record) => {
                    const product = record.bookSnapshot || record.comboSnapshot;
                    return product?.title || product?.name;
                  },
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'price',
                  render: (price) => formatPrice(price),
                },
                {
                  title: 'Thành tiền',
                  render: (_, record) =>
                    formatPrice(record.price * record.quantity),
                },
              ]}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        title="Hủy đơn hàng"
        open={cancelModalVisible}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason('');
          setOrderToCancel(null);
        }}
        onOk={handleConfirmCancel}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <strong>Lý do hủy đơn hàng:</strong>
          </div>
          <Input.TextArea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Nhập lý do hủy đơn hàng (tối thiểu 10 ký tự)..."
            rows={4}
            maxLength={500}
            showCount
          />
          <div style={{ color: '#999', fontSize: 12 }}>
            * Lý do hủy sẽ được gửi cho khách hàng
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default OrderManagementPage;