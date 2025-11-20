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
import { bookApi } from '@api';
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

      // TODO: Create API endpoint /api/book-copies
      // For now, mock data
      const mockData = {
        bookCopies: [],
        stats: {
          total: 450,
          available: 320,
          reserved: 45,
          sold: 85,
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 450,
        },
      };

      setBookCopies(mockData.bookCopies);
      setStats(mockData.stats);
      setPagination({
        current: mockData.pagination.page,
        pageSize: mockData.pagination.limit,
        total: mockData.pagination.total,
      });
    } catch (error) {
      console.error('Error fetching book copies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookCopies();
  }, [filters]);

  /**
   * Columns
   */
  const columns = [
    {
      title: 'Mã bản sao',
      dataIndex: '_id',
      key: '_id',
      width: 100,
      render: (id) => <Text code>{id.slice(-8)}</Text>,
    },
    {
      title: 'Sách',
      dataIndex: 'book',
      key: 'book',
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
      filters: [
        { text: 'Có sẵn', value: 'available' },
        { text: 'Đã đặt', value: 'reserved' },
        { text: 'Đã bán', value: 'sold' },
      ],
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
      filters: [
        { text: 'Mới', value: 'new' },
        { text: 'Như mới', value: 'like_new' },
        { text: 'Tốt', value: 'good' },
      ],
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
      render: (price) => formatPrice(price),
    },
    {
      title: 'Vị trí kho',
      dataIndex: 'warehouseLocation',
      key: 'warehouseLocation',
      render: (location) => <Text type="secondary">{location}</Text>,
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Ngày bán',
      dataIndex: 'soldAt',
      key: 'soldAt',
      render: (date) => (date ? formatDate(date) : '-'),
    },
  ];

  return (
    <div className="book-copy-management-page">
      <div className="page-header">
        <div>
          <Title level={2}>Quản lý Bản sao sách</Title>
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

          <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={bookCopies}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={(newPagination, filters, sorter) => {
          fetchBookCopies(newPagination.current);
        }}
        scroll={{ x: 1400 }}
      />
    </div>
  );
};

export default BookCopyManagementPage;