/**
 * ==============================================
 * REVIEW MANAGEMENT PAGE
 * ==============================================
 * Quản lý đánh giá của khách hàng
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
  Rate,
  Typography,
  Tag,
  Modal,
  Image,
  Avatar,
  Popconfirm,
  message,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { formatDate } from '@utils/formatDate';
import './ReviewManagementPage.scss';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const ReviewManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    rating: null,
    isVisible: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /**
   * Fetch reviews
   */
  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pagination.pageSize,
        ...filters,
      };

      // TODO: Create admin API endpoint
      const response = await axios.get('/admin/reviews', { params });

      setReviews(response.data.reviews || []);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.total,
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  /**
   * Handle view detail
   */
  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setDetailModalVisible(true);
  };

  /**
   * Handle toggle visibility
   */
  const handleToggleVisibility = async (reviewId, currentStatus) => {
    try {
      await axios.put(`/admin/reviews/${reviewId}/toggle-visible`);
      message.success(
        currentStatus ? 'Đã ẩn đánh giá' : 'Đã hiển thị đánh giá'
      );
      fetchReviews(pagination.current);
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (reviewId) => {
    try {
      await axios.delete(`/admin/reviews/${reviewId}`);
      message.success('Đã xóa đánh giá');
      fetchReviews(pagination.current);
    } catch (error) {
      message.error('Không thể xóa đánh giá');
    }
  };

  /**
   * Columns
   */
  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 180,
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.customer?.avatar}
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{record.customer?.fullName}</div>
            {record.isVerified && (
              <Tag color="green" style={{ fontSize: 11 }}>
                Đã mua hàng
              </Tag>
            )}
          </div>
        </Space>
      ),
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
      title: 'Đánh giá',
      key: 'rating',
      width: 200,
      render: (_, record) => (
        <div>
          <Rate disabled value={record.rating} style={{ fontSize: 14 }} />
          {record.title && (
            <div style={{ fontWeight: 600, marginTop: 4 }}>
              {record.title}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (comment) => (
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
          {comment}
        </Paragraph>
      ),
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images) => (
        <div>
          {images && images.length > 0 ? (
            <Tag color="blue">{images.length} ảnh</Tag>
          ) : (
            <Text type="secondary">Không có</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Hữu ích',
      dataIndex: 'likes',
      key: 'likes',
      render: (likes) => <Text strong>{likes || 0}</Text>,
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isVisible',
      key: 'isVisible',
      render: (isVisible) => (
        <Tag color={isVisible ? 'success' : 'default'}>
          {isVisible ? 'Hiển thị' : 'Đã ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>

          <Button
            size="small"
            icon={record.isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => handleToggleVisibility(record._id, record.isVisible)}
          >
            {record.isVisible ? 'Ẩn' : 'Hiện'}
          </Button>

          <Popconfirm
            title="Xóa đánh giá?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="review-management-page">
      <div className="page-header">
        <div>
          <Title level={2}>Quản lý Đánh giá</Title>
          <Text type="secondary">Tổng số: {pagination.total} đánh giá</Text>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <Space size="middle" wrap>
          <Search
            placeholder="Tìm kiếm theo sách hoặc khách hàng..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={(value) => setFilters({ ...filters, search: value })}
            style={{ width: 350 }}
          />

          <Select
            placeholder="Lọc theo sao"
            allowClear
            onChange={(value) => setFilters({ ...filters, rating: value })}
            style={{ width: 150 }}
            options={[
              { value: 5, label: '⭐⭐⭐⭐⭐ (5 sao)' },
              { value: 4, label: '⭐⭐⭐⭐ (4 sao)' },
              { value: 3, label: '⭐⭐⭐ (3 sao)' },
              { value: 2, label: '⭐⭐ (2 sao)' },
              { value: 1, label: '⭐ (1 sao)' },
            ]}
          />

          <Select
            placeholder="Trạng thái"
            allowClear
            onChange={(value) => setFilters({ ...filters, isVisible: value })}
            style={{ width: 150 }}
            options={[
              { value: true, label: 'Đang hiển thị' },
              { value: false, label: 'Đã ẩn' },
            ]}
          />
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={(newPagination) => fetchReviews(newPagination.current)}
        scroll={{ x: 1600 }}
      />

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đánh giá"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedReview && (
          <div className="review-detail">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Customer Info */}
              <div className="customer-section">
                <Space>
                  <Avatar
                    src={selectedReview.customer?.avatar}
                    icon={<UserOutlined />}
                    size={50}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {selectedReview.customer?.fullName}
                    </div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      {selectedReview.customer?.email}
                    </div>
                    {selectedReview.isVerified && (
                      <Tag color="green" style={{ marginTop: 4 }}>
                        ✓ Đã mua hàng
                      </Tag>
                    )}
                  </div>
                </Space>
              </div>

              {/* Book Info */}
              <div>
                <Text type="secondary">Sách:</Text>
                <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>
                  {selectedReview.book?.title}
                </div>
              </div>

              {/* Rating */}
              <div>
                <Text type="secondary">Đánh giá:</Text>
                <div style={{ marginTop: 4 }}>
                  <Rate disabled value={selectedReview.rating} />
                </div>
              </div>

              {/* Title */}
              {selectedReview.title && (
                <div>
                  <Text type="secondary">Tiêu đề:</Text>
                  <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>
                    {selectedReview.title}
                  </div>
                </div>
              )}

              {/* Comment */}
              <div>
                <Text type="secondary">Nội dung:</Text>
                <Paragraph style={{ marginTop: 8, fontSize: 15 }}>
                  {selectedReview.comment}
                </Paragraph>
              </div>

              {/* Images */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <Text type="secondary">Hình ảnh:</Text>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {selectedReview.images.map((img, index) => (
                      <Image
                        key={index}
                        src={img}
                        alt={`Review ${index + 1}`}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <Text type="secondary">Lượt thích:</Text>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {selectedReview.likes || 0}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Ngày đánh giá:</Text>
                  <div>{formatDate(selectedReview.createdAt)}</div>
                </div>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewManagementPage;