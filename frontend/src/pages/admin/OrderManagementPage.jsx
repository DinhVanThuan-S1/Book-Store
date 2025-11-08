/**
 * ==============================================
 * ORDER MANAGEMENT PAGE (Admin)
 * ==============================================
 * Quản lý đơn hàng cho admin
 */

import React, { useEffect, useState } from 'react';
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
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
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

const { Title } = Typography;
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
  const [updatingStatus, setUpdatingStatus] = useState(false);

  /**
   * Fetch orders
   */
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await orderApi.getAllOrders(params);

      setOrders(response.data.orders);
      setPagination({
        ...pagination,
        current: response.data.pagination.page,
        total: response.data.pagination.total,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

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
      setSelectedOrder(response.data.order);
      setDetailModalVisible(true);
    } catch (error) {
      showError('Không thể tải chi tiết đơn hàng');
    }
  };

  /**
   * Handle update status
   */
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);

      await orderApi.updateOrderStatus(selectedOrder._id, newStatus);

      showSuccess('Đã cập nhật trạng thái đơn hàng');
      setDetailModalVisible(false);
      fetchOrders(pagination.current);
    } catch (error) {
      showError(error || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdatingStatus(false);
    }
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
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => PAYMENT_METHOD_LABELS[method] || method,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={ORDER_STATUS_COLORS[status]}>
          {ORDER_STATUS_LABELS[status]}
        </Tag>
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
          selectedOrder?.status === ORDER_STATUS.PENDING ? (
            <Space>
              <Button onClick={() => setDetailModalVisible(false)}>
                Đóng
              </Button>
              <Button
                type="primary"
                onClick={() => handleUpdateStatus(ORDER_STATUS.CONFIRMED)}
                loading={updatingStatus}
              >
                Xác nhận đơn hàng
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>
          )
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
                <Tag color={ORDER_STATUS_COLORS[selectedOrder.status]}>
                  {ORDER_STATUS_LABELS[selectedOrder.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {`${selectedOrder.shippingAddress?.detailAddress}, ${selectedOrder.shippingAddress?.ward}, ${selectedOrder.shippingAddress?.district}, ${selectedOrder.shippingAddress?.province}`}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod]}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                  {formatPrice(selectedOrder.totalPrice)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24 }}>
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
    </div>
  );
};

export default OrderManagementPage;