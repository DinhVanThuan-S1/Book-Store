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
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { bookCopyApi } from '@api';
import { formatPrice } from '@utils/formatPrice';
import { formatDate } from '@utils/formatDate';
import './BookCopyManagementPage.scss';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const BookCopyManagementPage = () => {
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
  }, [filters, dateRange, dateType]);

  /**
   * Columns
   */
  const columns = [
    {
      title: 'Mã bản sao',
      dataIndex: 'copyCode',
      key: 'copyCode',
      width: 130,
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
      width: 110,
      render: (price) => formatPrice(price),
    },
    {
      title: 'Vị trí kho',
      dataIndex: 'warehouseLocation',
      key: 'warehouseLocation',
      width: 120,
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
  ];

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
            placeholder="Tìm kiếm bản sao..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={(value) => setFilters({ ...filters, search: value })}
            style={{ width: 300 }}
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
        pagination={pagination}
        onChange={(newPagination) => {
          fetchBookCopies(newPagination.current);
        }}
      />
    </div>
  );
};

export default BookCopyManagementPage;