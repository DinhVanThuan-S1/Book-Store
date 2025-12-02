/**
 * ==============================================
 * BOOK COPY MANAGEMENT PAGE
 * ==============================================
 * Quản lý bản sao sách (kho)
 * Author: DinhVanThuan-S1
 * Date: 2025-11-18
 */

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Typography,
  Tag,
  DatePicker,
  Row,
  Col,
  Card,
  Statistic,
  Dropdown,
  Menu,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { bookCopyApi } from '@api';
import { formatPrice } from '@utils/formatPrice';
import { formatDate } from '@utils/formatDate';
import { useMessage } from '@utils/notification';
import './BookCopyManagementPage.scss';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const BookCopyManagementPage = () => {
  const { message } = useMessage();
  const [bookCopies, setBookCopies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    sold: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: null,
    condition: null,
  });
  const [dateRange, setDateRange] = useState(null);
  const [dateType, setDateType] = useState('import'); // 'import' hoặc 'sold'
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  /**
   * Fetch book copies
   */
  const fetchBookCopies = async (page = 1) => {
    try {
      setLoading(true);

      // Gọi API thực
      const params = {
        page,
        limit: pagination.pageSize,
        ...filters,
      };

      // Thêm date range nếu có
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
        params.dateType = dateType; // 'import' hoặc 'sold'
      }

      // Xóa các filter null/undefined
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await bookCopyApi.getAllBookCopies(params);

      if (response.success) {
        setBookCopies(response.data.bookCopies);
        setStats(response.data.stats);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      console.error('Error fetching book copies:', error);
      // Có thể hiển thị message error cho user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookCopies(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dateRange, dateType, pagination.pageSize]);

  /**
   * Columns
   */
  const columns = [
    {
      title: 'Mã bản sao',
      dataIndex: 'copyCode',
      key: 'copyCode',
      width: 120,
      render: (copyCode) => <Text code>{copyCode}</Text>,
    },
    {
      title: 'Sách',
      dataIndex: 'book',
      key: 'book',
      width: 240,
      render: (book) => (
        <div>
          <div style={{ fontWeight: 600 }}>{book?.title}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {book?.author?.name}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 85,
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
      width: 85,
      render: (condition) => {
        const conditionMap = {
          new: 'Mới',
          like_new: 'Như mới',
          good: 'Tốt',
        };
        return conditionMap[condition] || condition;
      },
    },
    {
      title: 'Giá nhập',
      dataIndex: 'importPrice',
      key: 'importPrice',
      width: 85,
      render: (price) => formatPrice(price),
    },
    {
      title: 'Vị trí kho',
      dataIndex: 'warehouseLocation',
      key: 'warehouseLocation',
      width: 100,
      render: (location) => <Text type="secondary">{location}</Text>,
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'importDate',
      key: 'importDate',
      width: 110,
      render: (date) => formatDate(date),
    },
    {
      title: 'Ngày bán',
      dataIndex: 'soldDate',
      key: 'soldDate',
      width: 110,
      render: (date) => (date ? formatDate(date) : '-'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        const statusOptions = [
          { key: 'available', label: 'Có sẵn', color: 'success' },
          { key: 'reserved', label: 'Đã đặt', color: 'warning' },
          { key: 'sold', label: 'Đã bán', color: 'default' },
          { key: 'damaged', label: 'Hư hỏng', color: 'error' },
        ].filter(opt => opt.key !== record.status);

        const menu = (
          <Menu
            onClick={({ key }) => handleChangeStatus(record._id, key)}
            items={statusOptions.map(opt => ({
              key: opt.key,
              label: (
                <Space>
                  <Tag color={opt.color}>{opt.label}</Tag>
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
      },
    },
  ];

  /**
   * Handle change status
   */
  const handleChangeStatus = async (bookCopyId, newStatus) => {
    Modal.confirm({
      title: 'Xác nhận chuyển trạng thái',
      content: `Bạn có chắc chắn muốn chuyển trạng thái bản sao này?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await bookCopyApi.updateBookCopyStatus(bookCopyId, newStatus);
          message.success('Cập nhật trạng thái thành công');
          fetchBookCopies(pagination.current);
        } catch (error) {
          console.error('Error updating status:', error);
          message.error(error?.message || 'Không thể cập nhật trạng thái');
        }
      },
    });
  };

  return (
    <div className="book-copy-management-page">
      <div className="page-header">
        <div>
          <Title level={2}>Quản lý bản sao</Title>
          <Text type="secondary">Quản lý kho sách vật lý</Text>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng bản sao"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Có sẵn"
              value={stats.available}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã đặt"
              value={stats.reserved}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã bán"
              value={stats.sold}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <div className="toolbar">
        <Space size="middle" wrap>
          <Search
            placeholder="Tìm kiếm bản sao (Mã bản sao hoặc Tên sách)..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={(value) => setFilters({ ...filters, search: value })}
            style={{ width: 350 }}
          />

          <Select
            placeholder="Trạng thái"
            allowClear
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 150 }}
            options={[
              { value: 'available', label: 'Có sẵn' },
              { value: 'reserved', label: 'Đã đặt' },
              { value: 'sold', label: 'Đã bán' },
            ]}
          />

          <Select
            placeholder="Tình trạng"
            allowClear
            onChange={(value) => setFilters({ ...filters, condition: value })}
            style={{ width: 150 }}
            options={[
              { value: 'new', label: 'Mới' },
              { value: 'like_new', label: 'Như mới' },
              { value: 'good', label: 'Tốt' },
            ]}
          />

          <Select
            placeholder="Lọc theo ngày"
            value={dateType}
            onChange={(value) => setDateType(value)}
            style={{ width: 150 }}
            options={[
              { value: 'import', label: 'Ngày nhập' },
              { value: 'sold', label: 'Ngày bán' },
            ]}
          />

          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={(dates) => setDateRange(dates)}
            format="DD/MM/YYYY"
          />
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={bookCopies}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản sao`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={(newPagination) => {
          if (newPagination.pageSize !== pagination.pageSize) {
            setPagination({
              current: 1,
              pageSize: newPagination.pageSize,
              total: pagination.total,
            });
          } else {
            fetchBookCopies(newPagination.current);
          }
        }}
        scroll={{ x: 1400 }}
      />
    </div>
  );
};

export default BookCopyManagementPage;

