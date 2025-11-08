/**
 * ==============================================
 * CUSTOMER MANAGEMENT PAGE (Admin)
 * ==============================================
 * Quản lý khách hàng cho admin
 * Author: DinhVanThuan-S1
 * Date: 2025-11-06
 */

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
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { formatPrice } from '@utils/formatPrice';
import { formatDate } from '@utils/formatDate';
import { showSuccess, showError } from '@utils/notification';
import Loading from '@components/common/Loading';
import './CustomerManagementPage.scss';

const { Title, Text } = Typography;
const { Search } = Input;

const CustomerManagementPage = () => {
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);

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

      const response = await axios.get('/admin/customers', { params });

      setCustomers(response.data.data.customers);
      setPagination({
        ...pagination,
        current: response.data.data.pagination.page,
        total: response.data.data.pagination.total,
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      showError('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

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
    fetchCustomers(newPagination.current);
  };

  /**
   * Handle view customer detail
   */
  const handleViewDetail = async (customerId) => {
    try {
      const response = await axios.get(`/admin/customers/${customerId}`);
      setSelectedCustomer(response.data.data.customer);
      setCustomerStats(response.data.data.stats);
      setDetailModalVisible(true);
    } catch (error) {
      showError('Không thể tải thông tin khách hàng');
    }
  };

  /**
   * Handle toggle active status
   */
  const handleToggleActive = async (customerId, currentStatus) => {
    try {
      await axios.put(`/admin/customers/${customerId}/toggle-active`);

      showSuccess(
        `Đã ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản`
      );
      fetchCustomers(pagination.current);
    } catch (error) {
      showError(error || 'Không thể cập nhật trạng thái');
    }
  };

  /**
   * Handle delete customer
   */
  const handleDeleteCustomer = async (customerId) => {
    try {
      await axios.delete(`/admin/customers/${customerId}`);
      showSuccess('Đã xóa khách hàng');
      fetchCustomers(pagination.current);
    } catch (error) {
      showError(error || 'Không thể xóa khách hàng');
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
            size={40}
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
      width: 150,
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
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={customers}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
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
                size={80}
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
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerManagementPage;