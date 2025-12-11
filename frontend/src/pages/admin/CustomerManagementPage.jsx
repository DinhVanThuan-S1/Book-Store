

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Avatar,
  Modal,
  Typography,
  Descriptions,
  Switch,
  Popconfirm,
  Form,
  Select,
  DatePicker,
  Upload,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  UploadOutlined,
  ShoppingOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { customerApi, uploadApi } from '@api';
import { formatPrice } from '@utils/formatPrice';
import { formatDate } from '@utils/formatDate';
import { useMessage } from '@utils/notification';
import dayjs from 'dayjs';
import './CustomerManagementPage.scss';

const { Title, Text } = Typography;
const { Search } = Input;

const CustomerManagementPage = () => {
  const { message } = useMessage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    isActive: null,
  });

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customerAddresses, setCustomerAddresses] = useState([]); // ✅ Thêm state cho addresses

  // Orders & Reviews data
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ordersPagination, setOrdersPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [reviewsPagination, setReviewsPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const [form] = Form.useForm();

  /**
   * Fetch customers
   */
  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await customerApi.getCustomers(params);

      setCustomers(response.data.customers);
      setPagination({
        ...pagination,
        current: response.data.pagination.page,
        total: response.data.pagination.total,
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCustomers();
  }, [filters, pagination.pageSize]); // ✅ Thêm pagination.pageSize vào dependency

  /**
   * Handle search
   */
  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
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
      fetchCustomers(newPagination.current);
    }
  };

  /**
   * Handle view customer detail
   */
  const handleViewDetail = async (customerId) => {
    try {
      const response = await customerApi.getCustomerById(customerId);
      setSelectedCustomer(response.data.customer);
      setCustomerStats(response.data.stats);
      setCustomerAddresses(response.data.addresses || []); // ✅ Lưu addresses
      setDetailModalVisible(true);
    } catch (error) {
      message.error('Không thể tải thông tin khách hàng');
    }
  };

  /**
   * Handle toggle active status
   */
  const handleToggleActive = async (customerId, currentStatus) => {
    try {
      await customerApi.toggleCustomerActive(customerId);

      message.success(
        `Đã ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản`
      );
      fetchCustomers(pagination.current);
    } catch (error) {
      message.error(error?.message || 'Không thể cập nhật trạng thái');
    }
  };

  /**
   * Handle delete customer
   */
  const handleDeleteCustomer = async (customerId) => {
    try {
      await customerApi.deleteCustomer(customerId);
      message.success('Đã xóa khách hàng');
      fetchCustomers(pagination.current);
    } catch (error) {
      message.error(error?.message || 'Không thể xóa khách hàng');
    }
  };

  /**
   * Handle create customer
   */
  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setAvatarUrl('');
    form.resetFields();
    setFormModalVisible(true);
  };

  /**
   * Handle edit customer
   */
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setAvatarUrl(customer.avatar || '');

    form.setFieldsValue({
      fullName: customer.fullName,
      phone: customer.phone,
      gender: customer.gender,
      dateOfBirth: customer.dateOfBirth ? dayjs(customer.dateOfBirth) : null,
    });

    setFormModalVisible(true);
  };

  /**
   * Handle submit form
   */
  const handleSubmitForm = async (values) => {
    try {
      setSubmitting(true);

      const customerData = {
        fullName: values.fullName,
        phone: values.phone,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        avatar: avatarUrl || 'https://via.placeholder.com/150',
      };

      if (editingCustomer) {
        // Update existing customer
        await customerApi.updateCustomer(editingCustomer._id, customerData);
        message.success('Cập nhật khách hàng thành công');
      } else {
        // Create new customer
        customerData.email = values.email;
        customerData.password = values.password;
        await customerApi.createCustomer(customerData);
        message.success('Tạo khách hàng mới thành công');
      }

      setFormModalVisible(false);
      form.resetFields();
      setAvatarUrl('');
      setEditingCustomer(null);
      fetchCustomers(pagination.current);
    } catch (error) {
      console.error('Submit form error:', error);
      message.error(error?.message || 'Không thể lưu thông tin khách hàng');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle upload avatar
   */
  const handleUploadAvatar = async (file) => {
    try {
      setUploading(true);
      const response = await uploadApi.uploadImage(file);
      const url = response.data?.url || response.url;
      setAvatarUrl(url);
      message.success('Upload ảnh thành công!');
      return false; // Prevent auto upload
    } catch (error) {
      message.error('Upload ảnh thất bại!');
      return false;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle view orders history
   */
  const handleViewOrders = async (customer, page = 1) => {
    try {
      setSelectedCustomer(customer);
      setOrdersLoading(true);
      setOrdersModalVisible(true);

      const response = await customerApi.getCustomerOrders(customer._id, {
        page,
        limit: ordersPagination.pageSize,
      });

      setCustomerOrders(response.data.orders);
      setOrdersPagination({
        ...ordersPagination,
        current: response.data.pagination.page,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setOrdersLoading(false);
    }
  };

  /**
   * Handle view reviews history
   */
  const handleViewReviews = async (customer, page = 1) => {
    try {
      setSelectedCustomer(customer);
      setReviewsLoading(true);
      setReviewsModalVisible(true);

      const response = await customerApi.getCustomerReviews(customer._id, {
        page,
        limit: reviewsPagination.pageSize,
      });

      setCustomerReviews(response.data.reviews);
      setReviewsPagination({
        ...reviewsPagination,
        current: response.data.pagination.page,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error('Không thể tải lịch sử đánh giá');
    } finally {
      setReviewsLoading(false);
    }
  };

  /**
   * Table columns
   */
  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.avatar}
            icon={<UserOutlined />}
            size={48}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{record.fullName}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => {
        const genderMap = {
          male: 'Nam',
          female: 'Nữ',
          other: 'Khác',
        };
        return genderMap[gender] || 'N/A';
      },
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (date) => (date ? formatDate(date) : 'N/A'),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record._id, isActive)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Khóa"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record._id)}
          >
            Chi tiết
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditCustomer(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa khách hàng?"
            description="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={() => handleDeleteCustomer(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="customer-management-page">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2}>Quản lý khách hàng</Title>
        <Text type="secondary">
          Tổng : {pagination.total} khách hàng
        </Text>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <Space size="middle">
          <Search
            placeholder="Tìm kiếm khách hàng..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 400 }}
          />
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreateCustomer}
        >
          Thêm khách hàng mới
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={customers}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} khách hàng`,
          size: 'default',
        }}
        onChange={handleTableChange}
      />

      {/* Detail Modal */}
      <Modal
        title="Thông tin khách hàng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={
          <Button onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        }
      >
        {selectedCustomer && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                src={selectedCustomer.avatar}
                icon={<UserOutlined />}
                size={100}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>
                {selectedCustomer.fullName}
              </Title>
              <Text type="secondary">{selectedCustomer.email}</Text>
            </div>

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Số điện thoại">
                {selectedCustomer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {selectedCustomer.gender === 'male'
                  ? 'Nam'
                  : selectedCustomer.gender === 'female'
                    ? 'Nữ'
                    : 'Khác'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {selectedCustomer.dateOfBirth
                  ? formatDate(selectedCustomer.dateOfBirth)
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đăng ký">
                {formatDate(selectedCustomer.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedCustomer.isActive ? 'success' : 'error'}>
                  {selectedCustomer.isActive ? 'Hoạt động' : 'Đã khóa'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* ✅ Hiển thị địa chỉ */}
            {customerAddresses && customerAddresses.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Địa chỉ giao hàng</Title>
                {customerAddresses.map((address, index) => (
                  <div
                    key={address._id}
                    style={{
                      marginBottom: 12,
                      padding: 12,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      background: address.isDefault ? '#f6ffed' : '#fff'
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size={4}>
                      <Space>
                        <Text strong>{address.recipientName}</Text>
                        <Text type="secondary">|</Text>
                        <Text>{address.phone}</Text>
                        {address.isDefault && (
                          <Tag color="green" style={{ marginLeft: 8 }}>
                            Mặc định
                          </Tag>
                        )}
                        <Tag color="blue">
                          {address.addressType === 'home' ? 'Nhà riêng' :
                            address.addressType === 'office' ? 'Cơ quan' : 'Khác'}
                        </Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {address.detailAddress}, {address.ward}, {address.district}, {address.province}
                      </Text>
                    </Space>
                  </div>
                ))}
              </div>
            )}

            {customerStats && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Thống kê mua hàng</Title>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Tổng đơn hàng">
                    {customerStats.totalOrders}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng chi tiêu">
                    <Text strong style={{ color: '#f5222d' }}>
                      {formatPrice(customerStats.totalSpent)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Button
                type="primary"
                icon={<ShoppingOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleViewOrders(selectedCustomer);
                }}
                block
              >
                Xem lịch sử đơn hàng
              </Button>
              <Button
                type="default"
                icon={<StarOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleViewReviews(selectedCustomer);
                }}
                block
              >
                Xem lịch sử đánh giá
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal (Create/Edit) */}
      <Modal
        title={
          <Space>
            {editingCustomer ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</span>
          </Space>
        }
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          form.resetFields();
          setAvatarUrl('');
          setEditingCustomer(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitForm}
        >
          {/* Avatar Upload */}
          <Form.Item label="Ảnh đại diện">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                src={avatarUrl || 'https://via.placeholder.com/150'}
                icon={<UserOutlined />}
                size={80}
              />
              <Upload
                beforeUpload={handleUploadAvatar}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {uploading ? 'Đang upload...' : 'Upload ảnh'}
                </Button>
              </Upload>
            </div>
          </Form.Item>

          {/* Email (only for create) */}
          {!editingCustomer && (
            <>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            </>
          )}

          {/* Full Name */}
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              {
                pattern: /^[0-9]{10,11}$/,
                message: 'Số điện thoại phải có 10-11 chữ số!',
              },
            ]}
          >
            <Input placeholder="0123456789" />
          </Form.Item>

          {/* Gender */}
          <Form.Item name="gender" label="Giới tính">
            <Select placeholder="Chọn giới tính">
              <Select.Option value="male">Nam</Select.Option>
              <Select.Option value="female">Nữ</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>

          {/* Date of Birth */}
          <Form.Item name="dateOfBirth" label="Ngày sinh">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>

          {/* Submit Buttons */}
          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={editingCustomer ? <EditOutlined /> : <PlusOutlined />}
              >
                {editingCustomer ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button
                onClick={() => {
                  setFormModalVisible(false);
                  form.resetFields();
                  setAvatarUrl('');
                  setEditingCustomer(null);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Orders History Modal */}
      <Modal
        title={
          <Space>
            <ShoppingOutlined />
            <span>Lịch sử đơn hàng - {selectedCustomer?.fullName}</span>
          </Space>
        }
        open={ordersModalVisible}
        onCancel={() => {
          setOrdersModalVisible(false);
          setCustomerOrders([]);
        }}
        footer={
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setOrdersModalVisible(false);
                setDetailModalVisible(true);
              }}
            >
              Quay lại
            </Button>
            <Button onClick={() => setOrdersModalVisible(false)}>
              Đóng
            </Button>
          </Space>
        }
        width={900}
      >
        <Table
          columns={[
            {
              title: 'Mã đơn',
              dataIndex: 'orderNumber',
              key: 'orderNumber',
              width: 150,
              render: (orderNumber) => (
                <Text strong style={{ color: '#1890ff' }}>
                  {orderNumber}
                </Text>
              ),
            },
            {
              title: 'Ngày đặt',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 120,
              render: (date) => formatDate(date),
            },
            {
              title: 'Tổng tiền',
              dataIndex: 'totalPrice',
              key: 'totalPrice',
              width: 120,
              render: (price) => (
                <Text strong style={{ color: '#f5222d' }}>
                  {formatPrice(price)}
                </Text>
              ),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              width: 120,
              render: (status) => {
                const statusMap = {
                  pending: { color: 'default', text: 'Chờ xác nhận' },
                  confirmed: { color: 'blue', text: 'Đã xác nhận' },
                  preparing: { color: 'cyan', text: 'Đang chuẩn bị' },
                  shipping: { color: 'processing', text: 'Đang giao' },
                  delivered: { color: 'success', text: 'Đã giao' },
                  cancelled: { color: 'error', text: 'Đã hủy' },
                  returned: { color: 'warning', text: 'Hoàn trả' },
                };
                const statusInfo = statusMap[status] || statusMap.pending;
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
              },
            },
            {
              title: 'Số sản phẩm',
              dataIndex: 'items',
              key: 'items',
              width: 100,
              render: (items) => items?.length || 0,
            },
          ]}
          dataSource={customerOrders}
          rowKey="_id"
          loading={ordersLoading}
          pagination={{
            ...ordersPagination,
            onChange: (page) => handleViewOrders(selectedCustomer, page),
            showTotal: (total) => `Tổng ${total} đơn hàng`,
            size: 'default',
          }}
          size="small"
        />
      </Modal>

      {/* Reviews History Modal */}
      <Modal
        title={
          <Space>
            <StarOutlined />
            <span>Lịch sử đánh giá - {selectedCustomer?.fullName}</span>
          </Space>
        }
        open={reviewsModalVisible}
        onCancel={() => {
          setReviewsModalVisible(false);
          setCustomerReviews([]);
        }}
        footer={
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setReviewsModalVisible(false);
                setDetailModalVisible(true);
              }}
            >
              Quay lại
            </Button>
            <Button onClick={() => setReviewsModalVisible(false)}>
              Đóng
            </Button>
          </Space>
        }
        width={900}
      >
        <Table
          columns={[
            {
              title: 'Sách',
              dataIndex: 'book',
              key: 'book',
              width: 350,
              render: (book) => (
                <Space>
                  {book?.images?.[0] && (
                    <img
                      src={book.images[0]}
                      alt={book.title}
                      style={{
                        width: 40,
                        height: 56,
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />
                  )}
                  <Text>{book?.title || 'N/A'}</Text>
                </Space>
              ),
            },
            {
              title: 'Đánh giá',
              dataIndex: 'rating',
              key: 'rating',
              width: 100,
              render: (rating) => (
                <Space>
                  {'⭐'.repeat(rating)}

                </Space>
              ),
            },
            {
              title: 'Tiêu đề',
              dataIndex: 'title',
              key: 'title',
              width: 150,
              render: (title) => title || '-',
            },
            {
              title: 'Nội dung',
              dataIndex: 'comment',
              key: 'comment',
              width: 150,
              render: (comment) => (
                <Text ellipsis style={{ maxWidth: 200 }}>
                  {comment || '-'}
                </Text>
              ),
            },
            {
              title: 'Ngày',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 120,
              render: (date) => formatDate(date),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'isHidden',
              key: 'isHidden',
              width: 100,
              render: (isHidden) => (
                <Tag color={isHidden ? 'error' : 'success'}>
                  {isHidden ? 'Đã ẩn' : 'Hiển thị'}
                </Tag>
              ),
            },
          ]}
          dataSource={customerReviews}
          rowKey="_id"
          loading={reviewsLoading}
          pagination={{
            ...reviewsPagination,
            onChange: (page) => handleViewReviews(selectedCustomer, page),
            showTotal: (total) => `Tổng ${total} đánh giá`,
            size: 'default',
          }}
          size="small"
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '12px 24px' }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Nội dung đầy đủ:</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text>{record.comment || 'Không có nội dung'}</Text>
                </div>
                {record.images && record.images.length > 0 && (
                  <div>
                    <Text strong>Hình ảnh:</Text>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      {record.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review ${idx + 1}`}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ),
          }}
        />
      </Modal>
    </div>
  );
};

export default CustomerManagementPage;

