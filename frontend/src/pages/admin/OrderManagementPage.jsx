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
  Spin,
  Alert,
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { orderApi, bookCopyApi } from '@api';
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
    status: ORDER_STATUS.PENDING, // ✅ Mặc định hiển thị đơn chờ xác nhận
    sort: '-createdAt', // ✅ Mặc định sắp xếp đơn mới nhất
  });

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const [availableCopies, setAvailableCopies] = useState([]);

  // Batch processing states
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [batchStatusModalVisible, setBatchStatusModalVisible] = useState(false);
  const [batchTargetStatus, setBatchTargetStatus] = useState(null);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchCancelReason, setBatchCancelReason] = useState(''); // ✅ Lý do hủy cho batch

  /**
   * Check available copies for order
   */
  const checkAvailableCopies = async (order) => {
    const copiesData = [];
    let hasEnoughCopies = true;

    for (const item of order.items) {
      if (item.type === 'book' && item.book) {
        const copiesResponse = await bookCopyApi.getAllBookCopies({
          bookId: item.book._id,
          status: 'available',
          limit: 100,
        });

        const availableCount = copiesResponse.data.bookCopies?.length || 0;
        if (availableCount < item.quantity) {
          hasEnoughCopies = false;
        }

        copiesData.push({
          item,
          copies: copiesResponse.data.bookCopies || [],
          needed: item.quantity,
          available: availableCount,
        });
      } else if (item.type === 'combo' && item.combo) {
        const comboBooks = item.combo.books || [];
        const comboCopies = [];

        for (const bookItem of comboBooks) {
          if (bookItem.book) {
            const copiesResponse = await bookCopyApi.getAllBookCopies({
              bookId: bookItem.book._id,
              status: 'available',
              limit: 100,
            });

            const needed = bookItem.quantity * item.quantity;
            const availableCount = copiesResponse.data.bookCopies?.length || 0;

            if (availableCount < needed) {
              hasEnoughCopies = false;
            }

            comboCopies.push({
              book: bookItem.book,
              quantity: needed,
              copies: copiesResponse.data.bookCopies || [],
              available: availableCount,
            });
          }
        }

        copiesData.push({
          item,
          isCombo: true,
          comboBooks: comboCopies,
        });
      }
    }

    return { copiesData, hasEnoughCopies };
  };

  /**
   * Handle batch status change
   */
  const handleBatchStatusChange = async (targetStatus) => {
    if (selectedRowKeys.length === 0) {
      showError('Vui lòng chọn ít nhất một đơn hàng');
      return;
    }

    // Reset batch cancel reason
    setBatchCancelReason('');

    // Mở modal cho tất cả các trạng thái
    setBatchTargetStatus(targetStatus);
    setBatchStatusModalVisible(true);
  };

  /**
   * Process batch status update
   */
  const processBatchStatusUpdate = async () => {
    // ✅ Validate lý do hủy nếu là batch cancel
    if (batchTargetStatus === ORDER_STATUS.CANCELLED) {
      if (!batchCancelReason.trim()) {
        showError('Vui lòng nhập lý do hủy đơn');
        return;
      }
      if (batchCancelReason.trim().length < 10) {
        showError('Lý do hủy phải có ít nhất 10 ký tự');
        return;
      }
    }

    setBatchProcessing(true);
    const results = [];
    const selectedOrders = orders.filter(order => selectedRowKeys.includes(order._id));

    for (const order of selectedOrders) {
      try {
        // Kiểm tra xem đơn có thể chuyển sang trạng thái mới không
        const nextStatuses = getNextStatuses(order.status);

        if (!nextStatuses.includes(batchTargetStatus)) {
          results.push({
            orderId: order._id,
            orderNumber: order.orderNumber,
            success: false,
            message: `Không thể chuyển từ ${ORDER_STATUS_LABELS[order.status]} sang ${ORDER_STATUS_LABELS[batchTargetStatus]}`,
          });
          continue;
        }

        // Nếu là xác nhận đơn, kiểm tra bản sao
        if (batchTargetStatus === ORDER_STATUS.CONFIRMED) {
          const { hasEnoughCopies, copiesData } = await checkAvailableCopies(order);

          if (!hasEnoughCopies) {
            const missingItems = [];
            copiesData.forEach(data => {
              if (data.isCombo) {
                data.comboBooks.forEach(book => {
                  if (book.available < book.quantity) {
                    missingItems.push(`${book.book.title}: thiếu ${book.quantity - book.available} bản`);
                  }
                });
              } else {
                if (data.available < data.needed) {
                  missingItems.push(`${data.item.bookSnapshot?.title}: thiếu ${data.needed - data.available} bản`);
                }
              }
            });

            results.push({
              orderId: order._id,
              orderNumber: order.orderNumber,
              success: false,
              message: `Thiếu bản sao: ${missingItems.join(', ')}`,
              skipped: true,
            });
            continue;
          }
        }

        // Xử lý cập nhật trạng thái
        // ✅ Truyền cancelReason nếu là cancel
        if (batchTargetStatus === ORDER_STATUS.CANCELLED) {
          await orderApi.updateOrderStatus(order._id, batchTargetStatus, batchCancelReason);
        } else {
          await orderApi.updateOrderStatus(order._id, batchTargetStatus);
        }

        results.push({
          orderId: order._id,
          orderNumber: order.orderNumber,
          success: true,
          message: `Đã chuyển sang ${ORDER_STATUS_LABELS[batchTargetStatus]}`,
        });
      } catch (error) {
        results.push({
          orderId: order._id,
          orderNumber: order.orderNumber,
          success: false,
          message: error.message || 'Lỗi không xác định',
        });
      }
    }

    setBatchResults(results);
    setBatchProcessing(false);

    // Refresh danh sách đơn hàng
    await fetchOrders(pagination.current);

    // Reset selection
    setSelectedRowKeys([]);

    // Hiển thị kết quả
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const skippedCount = results.filter(r => r.skipped).length;

    if (failCount === 0 && skippedCount === 0) {
      showSuccess(`Đã cập nhật thành công ${successCount} đơn hàng`);
      setBatchStatusModalVisible(false);
      setBatchResults([]);
    } else {
      showSuccess(`Thành công: ${successCount}, Thất bại: ${failCount}, Bỏ qua: ${skippedCount}`);
    }
  };

  /**
   * Get common next status for selected orders
   */
  const getCommonNextStatuses = () => {
    if (selectedRowKeys.length === 0) return [];

    const selectedOrders = orders.filter(order => selectedRowKeys.includes(order._id));
    if (selectedOrders.length === 0) return [];

    // Lấy danh sách trạng thái tiếp theo của đơn đầu tiên
    let commonStatuses = getNextStatuses(selectedOrders[0].status);

    // Lọc ra các trạng thái chung cho tất cả các đơn được chọn
    for (let i = 1; i < selectedOrders.length; i++) {
      const nextStatuses = getNextStatuses(selectedOrders[i].status);
      commonStatuses = commonStatuses.filter(status => nextStatuses.includes(status));
    }

    return commonStatuses;
  };

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
   * Handle sort change
   */
  const handleSortChange = (value) => {
    setFilters({ ...filters, sort: value });
  };

  /**
   * Handle table change
   */
  const handleTableChange = (newPagination) => {
    // ✅ Cập nhật cả pageSize nếu thay đổi
    if (newPagination.pageSize !== pagination.pageSize) {
      setPagination({
        current: 1, // Reset về trang 1 khi đổi pageSize
        pageSize: newPagination.pageSize,
        total: pagination.total,
      });
    } else {
      fetchOrders(newPagination.current);
    }
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

    // Nếu là xác nhận đơn (pending -> confirmed), hiển thị danh sách bản sao
    if (newStatus === ORDER_STATUS.CONFIRMED) {
      try {
        // Lấy thông tin đơn hàng đầy đủ
        const response = await orderApi.getOrderById(orderId);
        const orderData = response.data?.order || response.order;

        setOrderToConfirm(orderData);

        // Lấy danh sách bản sao available cho từng sách trong đơn
        const copiesData = [];
        let hasEnoughCopies = true;

        for (const item of orderData.items) {
          if (item.type === 'book' && item.book) {
            const copiesResponse = await bookCopyApi.getAllBookCopies({
              bookId: item.book._id,
              status: 'available',
              limit: 100,
            });

            const availableCount = copiesResponse.data.bookCopies?.length || 0;
            if (availableCount < item.quantity) {
              hasEnoughCopies = false;
            }

            copiesData.push({
              item,
              copies: copiesResponse.data.bookCopies || [],
              needed: item.quantity,
              available: availableCount,
            });
          } else if (item.type === 'combo' && item.combo) {
            // Đối với combo, lấy bản sao của từng sách trong combo
            const comboBooks = item.combo.books || [];
            const comboCopies = [];

            for (const bookItem of comboBooks) {
              if (bookItem.book) {
                const copiesResponse = await bookCopyApi.getAllBookCopies({
                  bookId: bookItem.book._id,
                  status: 'available',
                  limit: 100,
                });

                const needed = bookItem.quantity * item.quantity;
                const availableCount = copiesResponse.data.bookCopies?.length || 0;

                if (availableCount < needed) {
                  hasEnoughCopies = false;
                }

                comboCopies.push({
                  book: bookItem.book,
                  quantity: needed,
                  copies: copiesResponse.data.bookCopies || [],
                  available: availableCount,
                });
              }
            }

            copiesData.push({
              item,
              isCombo: true,
              comboBooks: comboCopies,
            });
          }
        }

        setAvailableCopies(copiesData);

        // Nếu thiếu bản sao, hiển thị cảnh báo và không cho xác nhận
        if (!hasEnoughCopies) {
          Modal.warning({
            title: 'Không thể xác nhận đơn hàng',
            content: (
              <div>
                <p>Không đủ bản sao để xác nhận đơn hàng này.</p>
                {copiesData.map((data, index) => {
                  if (data.isCombo) {
                    return data.comboBooks?.map((book, bookIndex) => {
                      if (book.available < book.quantity) {
                        return (
                          <div key={`${index}-${bookIndex}`} style={{ color: '#ff4d4f', marginTop: 8 }}>
                            ⚠️ {book.book.title}: cần {book.quantity} bản, chỉ còn {book.available} bản
                          </div>
                        );
                      }
                      return null;
                    });
                  } else if (data.available < data.needed) {
                    return (
                      <div key={index} style={{ color: '#ff4d4f', marginTop: 8 }}>
                        ⚠️ {data.item.bookSnapshot?.title}: cần {data.needed} bản, chỉ còn {data.available} bản
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ),
            width: 500,
          });
          return;
        }

        setConfirmModalVisible(true);
      } catch (error) {
        console.error('Error loading available copies:', error);
        showError('Không thể tải danh sách bản sao');
      }
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
   * Handle confirm order with copies info
   */
  const handleConfirmOrderWithCopies = async () => {
    try {
      await orderApi.updateOrderStatus(orderToConfirm._id, ORDER_STATUS.CONFIRMED);
      showSuccess('Đã xác nhận đơn hàng');
      fetchOrders(pagination.current);

      setConfirmModalVisible(false);
      setOrderToConfirm(null);
      setAvailableCopies([]);

      if (detailModalVisible) {
        setDetailModalVisible(false);
      }
    } catch (error) {
      showError(error.message || 'Không thể xác nhận đơn hàng');
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
            Chi tiết
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
        <Text type="secondary">
          Tổng : {pagination.total} đơn hàng
        </Text>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <Space size="middle" wrap>
          <Search
            placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 350 }}
          />

          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            onChange={handleStatusChange}
            value={filters.status} // ✅ Hiển thị giá trị hiện tại
            style={{ width: 200 }}
            options={[
              { value: null, label: 'Tất cả trạng thái' },
              ...Object.keys(ORDER_STATUS).map((key) => ({
                value: ORDER_STATUS[key],
                label: ORDER_STATUS_LABELS[ORDER_STATUS[key]],
              })),
            ]}
          />

          <Select
            placeholder="Sắp xếp"
            value={filters.sort}
            onChange={handleSortChange}
            style={{ width: 200 }}
            options={[
              { value: '-createdAt', label: 'Đơn mới nhất' },
              { value: 'createdAt', label: 'Đơn cũ nhất' },
              { value: '-totalPrice', label: 'Tổng tiền cao đến thấp' },
              { value: 'totalPrice', label: 'Tổng tiền thấp đến cao' },
            ]}
          />

          {/* Batch actions */}
          {selectedRowKeys.length > 0 && (
            <>
              <Text strong style={{ marginLeft: 16 }}>
                Đã chọn: {selectedRowKeys.length} đơn
              </Text>
              <Dropdown
                overlay={
                  <Menu
                    onClick={({ key }) => handleBatchStatusChange(key)}
                    items={getCommonNextStatuses().map(status => ({
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
                disabled={getCommonNextStatuses().length === 0}
              >
                <Button type="primary">
                  Chuyển trạng thái hàng loạt <DownOutlined />
                </Button>
              </Dropdown>
              <Button onClick={() => setSelectedRowKeys([])}>
                Bỏ chọn
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
          getCheckboxProps: (record) => ({
            disabled: getNextStatuses(record.status).length === 0,
          }),
        }}
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

            {/* Danh sách bản sao đã lấy */}
            {selectedOrder.status !== ORDER_STATUS.PENDING && selectedOrder.items?.some(item => item.soldCopies && item.soldCopies.length > 0) && (
              <>
                <Title level={5} style={{ marginTop: 24 }}>
                  Bản sao đã lấy
                </Title>
                {selectedOrder.items.map((item, itemIndex) => {
                  if (!item.soldCopies || item.soldCopies.length === 0) return null;

                  const product = item.bookSnapshot || item.comboSnapshot;
                  const productName = product?.title || product?.name;

                  return (
                    <div key={itemIndex} style={{ marginBottom: 16, border: '1px solid #d9d9d9', borderRadius: 4, padding: 12 }}>
                      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
                        {item.type === 'combo' ? '📦 ' : '📖 '}{productName}
                      </Text>
                      <Table
                        size="small"
                        dataSource={item.soldCopies}
                        rowKey="_id"
                        columns={[
                          {
                            title: 'Mã bản sao',
                            dataIndex: 'copyCode',
                            key: 'copyCode',
                            width: 130,
                            render: (code) => <Tag color="blue">{code}</Tag>,
                          },
                          {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            width: 100,
                            render: (status) => {
                              const statusMap = {
                                available: { color: 'success', text: 'Có sẵn' },
                                reserved: { color: 'warning', text: 'Đã đặt' },
                                sold: { color: 'default', text: 'Đã bán' },
                              };
                              return (
                                <Tag color={statusMap[status]?.color}>
                                  {statusMap[status]?.text}
                                </Tag>
                              );
                            },
                          },
                          {
                            title: 'Tình trạng',
                            dataIndex: 'condition',
                            key: 'condition',
                            width: 100,
                            render: (condition) => {
                              const map = { new: 'Mới', like_new: 'Như mới', good: 'Tốt' };
                              return map[condition] || condition;
                            },
                          },
                          {
                            title: 'Vị trí kho',
                            dataIndex: 'warehouseLocation',
                            key: 'warehouseLocation',
                            width: 120,
                            render: (loc) => <Text type="secondary">{loc}</Text>,
                          },
                          {
                            title: 'Ngày nhập',
                            dataIndex: 'importDate',
                            key: 'importDate',
                            width: 110,
                            render: (date) => formatDate(date),
                          },
                        ]}
                        pagination={false}
                      />
                    </div>
                  );
                })}
              </>
            )}
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

      {/* Confirm Order Modal with Book Copies */}
      <Modal
        title={`Xác nhận đơn hàng - ${orderToConfirm?.orderNumber}`}
        open={confirmModalVisible}
        onCancel={() => {
          setConfirmModalVisible(false);
          setOrderToConfirm(null);
          setAvailableCopies([]);
        }}
        onOk={handleConfirmOrderWithCopies}
        okText="Xác nhận đơn hàng"
        cancelText="Hủy"
        width={900}
      >
        <div>
          <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
            <Text strong>Thông tin đơn hàng:</Text>
            <div style={{ marginTop: 8 }}>
              <div>Khách hàng: <strong>{orderToConfirm?.customer?.fullName}</strong></div>
              <div>Tổng tiền: <strong style={{ color: '#f5222d' }}>{formatPrice(orderToConfirm?.totalPrice)}</strong></div>
            </div>
          </div>

          {/* Hiển thị cảnh báo nếu thiếu bản sao */}
          {availableCopies.some(data => {
            if (data.isCombo) {
              return data.comboBooks?.some(book => book.available < book.quantity);
            }
            return data.available < data.needed;
          }) && (
              <Alert
                message="Cảnh báo: Thiếu bản sao"
                description="Một số sản phẩm không đủ bản sao. Vui lòng kiểm tra lại."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

          <Title level={5}>Danh sách bản sao sẽ lấy (Có sẵn → Đã đặt)</Title>

          {availableCopies.map((copyData, index) => (
            <div key={index} style={{ marginBottom: 24, border: '1px solid #d9d9d9', borderRadius: 4, padding: 16 }}>
              {copyData.isCombo ? (
                <div>
                  <Text strong style={{ fontSize: 16 }}>
                    Combo: {copyData.item.comboSnapshot?.name}
                  </Text>
                  <div style={{ marginTop: 12 }}>
                    {copyData.comboBooks?.map((bookData, bookIndex) => (
                      <div key={bookIndex} style={{ marginBottom: 16, paddingLeft: 16, borderLeft: '3px solid #1890ff' }}>
                        <Text strong>{bookData.book.title}</Text>
                        <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                          Cần: <strong>{bookData.quantity}</strong> bản sao
                        </div>
                        <Table
                          size="small"
                          dataSource={bookData.copies.slice(0, bookData.quantity)}
                          columns={[
                            {
                              title: 'Mã bản sao',
                              dataIndex: 'copyCode',
                              key: 'copyCode',
                              width: 120,
                              render: (code) => <Tag color="blue">{code}</Tag>,
                            },
                            {
                              title: 'Tình trạng',
                              dataIndex: 'condition',
                              key: 'condition',
                              width: 100,
                              render: (condition) => {
                                const map = { new: 'Mới', like_new: 'Như mới', good: 'Tốt' };
                                return map[condition] || condition;
                              },
                            },
                            {
                              title: 'Vị trí kho',
                              dataIndex: 'warehouseLocation',
                              key: 'warehouseLocation',
                              render: (loc) => <Text type="secondary">{loc}</Text>,
                            },
                          ]}
                          pagination={false}
                          style={{ marginTop: 8 }}
                        />
                        {bookData.copies.length < bookData.quantity && (
                          <div style={{ color: '#ff4d4f', marginTop: 8, fontSize: 12 }}>
                            ⚠️ Chỉ có {bookData.copies.length}/{bookData.quantity} bản sao. Thiếu {bookData.quantity - bookData.copies.length} bản.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <Text strong style={{ fontSize: 16 }}>
                    {copyData.item.bookSnapshot?.title}
                  </Text>
                  <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                    Cần: <strong>{copyData.item.quantity}</strong> bản sao
                  </div>
                  <Table
                    size="small"
                    dataSource={copyData.copies.slice(0, copyData.item.quantity)}
                    columns={[
                      {
                        title: 'Mã bản sao',
                        dataIndex: 'copyCode',
                        key: 'copyCode',
                        width: 120,
                        render: (code) => <Tag color="blue">{code}</Tag>,
                      },
                      {
                        title: 'Tình trạng',
                        dataIndex: 'condition',
                        key: 'condition',
                        width: 100,
                        render: (condition) => {
                          const map = { new: 'Mới', like_new: 'Như mới', good: 'Tốt' };
                          return map[condition] || condition;
                        },
                      },
                      {
                        title: 'Vị trí kho',
                        dataIndex: 'warehouseLocation',
                        key: 'warehouseLocation',
                        render: (loc) => <Text type="secondary">{loc}</Text>,
                      },
                    ]}
                    pagination={false}
                    style={{ marginTop: 8 }}
                  />
                  {copyData.copies.length < copyData.item.quantity && (
                    <div style={{ color: '#ff4d4f', marginTop: 8, fontSize: 12 }}>
                      ⚠️ Chỉ có {copyData.copies.length}/{copyData.item.quantity} bản sao. Thiếu {copyData.item.quantity - copyData.copies.length} bản.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: 12, borderRadius: 4, marginTop: 16 }}>
            <Text strong>💡 Lưu ý:</Text>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>Hệ thống sẽ tự động chọn các bản sao tốt nhất (mới nhất, tình trạng tốt nhất)</li>
              <li>Sau khi xác nhận, các bản sao sẽ chuyển trạng thái từ "Có sẵn" sang "Đã đặt"</li>
              <li>Tồn kho sẽ giảm tương ứng</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Batch Status Update Modal */}
      <Modal
        title="Xử lý hàng loạt"
        open={batchStatusModalVisible}
        onCancel={() => {
          if (!batchProcessing) {
            setBatchStatusModalVisible(false);
            setBatchTargetStatus(null);
            setBatchResults([]);
            setBatchCancelReason(''); // ✅ Reset lý do hủy
          }
        }}
        footer={
          batchResults.length > 0 ? (
            <Button type="primary" onClick={() => {
              setBatchStatusModalVisible(false);
              setBatchTargetStatus(null);
              setBatchResults([]);
              setBatchCancelReason(''); // ✅ Reset lý do hủy
            }}>
              Đóng
            </Button>
          ) : (
            <Space>
              <Button onClick={() => {
                setBatchStatusModalVisible(false);
                setBatchTargetStatus(null);
                setBatchCancelReason(''); // ✅ Reset lý do hủy
              }} disabled={batchProcessing}>
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={processBatchStatusUpdate}
                loading={batchProcessing}
              >
                Xác nhận
              </Button>
            </Space>
          )
        }
        width={800}
        closable={!batchProcessing}
        maskClosable={!batchProcessing}
      >
        {batchProcessing ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Đang xử lý... Vui lòng đợi</Text>
            </div>
          </div>
        ) : batchResults.length > 0 ? (
          <div>
            <Title level={5}>Kết quả xử lý</Title>
            <Table
              dataSource={batchResults}
              columns={[
                {
                  title: 'Mã đơn',
                  dataIndex: 'orderNumber',
                  key: 'orderNumber',
                  render: (text) => <Text strong>{text}</Text>,
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'success',
                  key: 'success',
                  render: (success, record) => (
                    <Tag color={success ? 'success' : record.skipped ? 'warning' : 'error'}>
                      {success ? 'Thành công' : record.skipped ? 'Bỏ qua' : 'Thất bại'}
                    </Tag>
                  ),
                },
                {
                  title: 'Thông báo',
                  dataIndex: 'message',
                  key: 'message',
                },
              ]}
              pagination={false}
              size="small"
            />
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
              <Text strong>Số đơn đã chọn: {selectedRowKeys.length}</Text>
              <div style={{ marginTop: 8 }}>
                <Text>Chuyển sang trạng thái: </Text>
                <Tag color={ORDER_STATUS_COLORS[batchTargetStatus]}>
                  {ORDER_STATUS_LABELS[batchTargetStatus]}
                </Tag>
              </div>
            </div>

            {/* ✅ Form nhập lý do hủy nếu là cancel */}
            {batchTargetStatus === ORDER_STATUS.CANCELLED && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ color: '#ff4d4f' }}>Lý do hủy đơn hàng:</Text>
                </div>
                <Input.TextArea
                  value={batchCancelReason}
                  onChange={(e) => setBatchCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy đơn hàng (tối thiểu 10 ký tự)..."
                  rows={4}
                  maxLength={500}
                  showCount
                />
                <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                  * Lý do hủy sẽ được gửi cho khách hàng
                </div>
              </div>
            )}

            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: 12, borderRadius: 4 }}>
              <Text strong>💡 Lưu ý:</Text>
              <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                <li>Hệ thống sẽ xử lý từng đơn từ trên xuống dưới</li>
                <li>Đơn nào thiếu bản sao (khi xác nhận) sẽ bị bỏ qua và giữ nguyên trạng thái</li>
                <li>Đơn tiếp theo sẽ tiếp tục được xử lý</li>
                <li>Bạn sẽ thấy kết quả chi tiết sau khi xử lý xong</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagementPage;