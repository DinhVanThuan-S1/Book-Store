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
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import axiosInstance from '@api/axiosConfig';
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
      };

      // Thêm filters vào params
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.rating) {
        params.rating = filters.rating;
      }
      if (filters.isVisible !== null && filters.isVisible !== undefined) {
        params.isVisible = filters.isVisible;
      }

      // Gọi API
      console.log('Fetching reviews with params:', params);
      const response = await axiosInstance.get('/reviews/admin/all', { params });
      console.log('API Response:', response);

      // Kiểm tra response có data không
      if (response?.data?.reviews) {
        setReviews(response.data.reviews);
        setPagination({
          current: response.data.pagination?.page || page,
          pageSize: response.data.pagination?.limit || pagination.pageSize,
          total: response.data.pagination?.total || 0,
        });
      } else {
        setReviews([]);
        setPagination({
          current: page,
          pageSize: pagination.pageSize,
          total: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải danh sách đánh giá');
      setReviews([]);
      setPagination({
        current: page,
        pageSize: pagination.pageSize,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1); // Reset về trang 1 khi filter thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.rating, filters.isVisible]);

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
      await axiosInstance.put(`/reviews/admin/${reviewId}/toggle-visibility`);
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
      await axiosInstance.delete(`/reviews/admin/${reviewId}`);
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
          <Title level={2}>Quản lý đánh giá</Title>
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
              { value: 5, label: '⭐⭐⭐⭐⭐' },
              { value: 4, label: '⭐⭐⭐⭐' },
              { value: 3, label: '⭐⭐⭐' },
              { value: 2, label: '⭐⭐' },
              { value: 1, label: '⭐' },
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
        width={700}
        footer={
          <Button onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        }
      >
        {selectedReview && (
          <div>
            {/* Customer Info - Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                src={selectedReview.customer?.avatar}
                icon={<UserOutlined />}
                size={80}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>
                {selectedReview.customer?.fullName}
              </Title>
              <Text type="secondary">{selectedReview.customer?.email}</Text>
              {selectedReview.isVerified && (
                <div style={{ marginTop: 8 }}>
                  <Tag color="green">✓ Đã mua hàng</Tag>
                </div>
              )}
            </div>

            {/* Review Details */}
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Sách" span={2}>
                <Space>
                  {selectedReview.book?.images?.[0] && (
                    <Image
                      src={selectedReview.book.images[0]}
                      alt={selectedReview.book.title}
                      width={40}
                      height={40}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {selectedReview.book?.title}
                    </div>
                    {selectedReview.book?.author?.name && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {selectedReview.book.author.name}
                      </Text>
                    )}
                  </div>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Đánh giá">
                <Rate disabled value={selectedReview.rating} style={{ fontSize: 16 }} />
              </Descriptions.Item>

              <Descriptions.Item label="Lượt thích">
                <Text strong>{selectedReview.likes || 0}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày đánh giá" span={2}>
                {formatDate(selectedReview.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedReview.isVisible ? 'success' : 'default'}>
                  {selectedReview.isVisible ? 'Hiển thị' : 'Đã ẩn'}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Tiêu đề" span={2}>
                {selectedReview.title && selectedReview.title.trim() !== '' ? (
                  <Text strong>{selectedReview.title}</Text>
                ) : (
                  <Text type="secondary" italic>Không có tiêu đề</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Nội dung" span={2}>
                {selectedReview.comment && selectedReview.comment.trim() !== '' ? (
                  <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                    {selectedReview.comment}
                  </Paragraph>
                ) : (
                  <Text type="secondary" italic>Không có nội dung</Text>
                )}
              </Descriptions.Item>

              {selectedReview.images && selectedReview.images.length > 0 && (
                <Descriptions.Item label="Hình ảnh" span={2}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Action Buttons */}
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Button
                type={selectedReview.isVisible ? 'default' : 'primary'}
                icon={selectedReview.isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => {
                  handleToggleVisibility(selectedReview._id, selectedReview.isVisible);
                  setDetailModalVisible(false);
                }}
                block
              >
                {selectedReview.isVisible ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
              </Button>
              <Popconfirm
                title="Xóa đánh giá?"
                description="Bạn có chắc chắn muốn xóa đánh giá này?"
                onConfirm={() => {
                  handleDelete(selectedReview._id);
                  setDetailModalVisible(false);
                }}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />} block>
                  Xóa đánh giá
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewManagementPage;