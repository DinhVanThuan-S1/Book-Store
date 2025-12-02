/**
 * ==============================================
 * REVIEW LIST COMPONENT
 * ==============================================
 * Hiển thị danh sách đánh giá của sách
 */

import React, { useState, useEffect } from 'react';
import { List, Rate, Avatar, Button, Space, Typography, Empty, Pagination } from 'antd';
import { LikeOutlined, LikeFilled, UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { reviewApi } from '@api';
import { formatDate } from '@utils/formatDate';
import { useMessage } from '@utils/notification';
import Loading from '@components/common/Loading';
import './ReviewList.scss';

const { Text } = Typography;

/**
 * ReviewList Component
 * @param {Object} props
 * @param {String} props.bookId - ID sách
 */
const ReviewList = ({ bookId }) => {
  const { message } = useMessage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  /**
   * Fetch reviews
   */
  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);

      const response = await reviewApi.getBookReviews(bookId, {
        page,
        limit: 10,
        sortBy: '-likes', // Sort theo likes cao nhất
      });

      setReviews(response.data.reviews || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchReviews();
    }
  }, [bookId]);

  /**
   * Handle like/unlike review
   */
  const handleLikeReview = async (reviewId) => {
    if (!isAuthenticated) {
      message.error('Vui lòng đăng nhập để thích đánh giá');
      return;
    }

    try {
      const response = await reviewApi.likeReview(reviewId);
      const { hasLiked } = response.data;

      // Update local state
      setReviews((prevReviews) =>
        prevReviews.map((review) => {
          if (review._id === reviewId) {
            const newLikedBy = hasLiked
              ? [...(review.likedBy || []), user._id]
              : (review.likedBy || []).filter(id => id !== user._id);

            return {
              ...review,
              likes: hasLiked ? review.likes + 1 : Math.max(0, review.likes - 1),
              likedBy: newLikedBy,
            };
          }
          return review;
        })
      );
    } catch (error) {
      message.error(error?.message || 'Không thể thích đánh giá');
    }
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page) => {
    fetchReviews(page);
  };

  if (loading) {
    return <Loading />;
  }

  if (reviews.length === 0) {
    return (
      <Empty
        description="Chưa có đánh giá nào"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="review-list">
      <List
        dataSource={reviews}
        renderItem={(review) => (
          <List.Item className="review-item">
            <List.Item.Meta
              avatar={
                <Avatar
                  src={review.customer?.avatar}
                  icon={<UserOutlined />}
                  size={48}
                />
              }
              title={
                <Space direction="vertical" size={0}>
                  <Text strong>{review.customer?.fullName || 'Anonymous'}</Text>
                  <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
                </Space>
              }
              description={
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {review.title && (
                    <Text strong className="review-title">
                      {review.title}
                    </Text>
                  )}

                  <Text className="review-comment">{review.comment}</Text>

                  {review.images && review.images.length > 0 && (
                    <div className="review-images">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review ${index + 1}`}
                          className="review-image"
                        />
                      ))}
                    </div>
                  )}

                  <div className="review-footer">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(review.createdAt)}
                    </Text>

                    {review.isVerified && (
                      <Text type="success" style={{ fontSize: 12 }}>
                        ✓ Đã mua hàng
                      </Text>
                    )}

                    <Button
                      type={review.likedBy?.includes(user?._id) ? 'primary' : 'text'}
                      size="small"
                      icon={review.likedBy?.includes(user?._id) ? <LikeFilled /> : <LikeOutlined />}
                      onClick={() => handleLikeReview(review._id)}
                    >
                      Hữu ích ({review.likes || 0})
                    </Button>
                  </div>
                </Space>
              }
            />
          </List.Item>
        )}
      />

      {pagination.pages > 1 && (
        <div className="review-pagination">
          <Pagination
            current={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewList;
