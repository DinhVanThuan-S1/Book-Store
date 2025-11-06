/**
 * ==============================================
 * RATING SUMMARY COMPONENT
 * ==============================================
 * Hiển thị tổng kết rating của sách
 */

import React, { useState, useEffect } from 'react';
import { Card, Rate, Progress, Space, Typography } from 'antd';
import { reviewApi } from '@api';
import './RatingSummary.scss';

const { Title, Text } = Typography;

/**
 * RatingSummary Component
 * @param {Object} props
 * @param {Object} props.book - Thông tin sách
 */
const RatingSummary = ({ book }) => {
  const [stats, setStats] = useState(null);

  /**
   * Fetch rating stats
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await reviewApi.getBookRatingStats(book._id);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching rating stats:', error);
      }
    };

    if (book?._id) {
      fetchStats();
    }
  }, [book]);

  if (!stats) {
    return null;
  }

  const { distribution, total } = stats;

  /**
   * Calculate percentage
   */
  const getPercentage = (count) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <Card className="rating-summary">
      <div className="rating-overview">
        <div className="average-rating">
          <Title level={1} style={{ margin: 0, color: '#faad14' }}>
            {book.averageRating.toFixed(1)}
          </Title>
          <Rate disabled allowHalf value={book.averageRating} />
          <Text type="secondary">{total} đánh giá</Text>
        </div>

        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="rating-row">
              <Text className="star-label">{star} ⭐</Text>
              <Progress
                percent={getPercentage(distribution[star])}
                showInfo={false}
                strokeColor="#faad14"
              />
              <Text className="count-label">{distribution[star]}</Text>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RatingSummary;