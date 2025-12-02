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

        console.log('📊 Rating Stats API Response:', response);

        // API trả về response.data.data (nested)
        const statsData = response.data?.data || response.data;
        console.log('📊 Stats Data:', statsData);
        setStats(statsData);
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

  const distribution = stats.distribution || {};
  const total = stats.total || 0;

  // Đảm bảo distribution có đầy đủ keys từ 1-5
  const fullDistribution = {
    5: distribution[5] || 0,
    4: distribution[4] || 0,
    3: distribution[3] || 0,
    2: distribution[2] || 0,
    1: distribution[1] || 0,
  };

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
          {[5, 4, 3, 2, 1].map((star) => {
            const count = fullDistribution[star];
            const percentage = getPercentage(count);

            return (
              <div key={star} className="rating-row">
                <Text className="star-label" style={{ minWidth: '50px' }}>
                  {star} ⭐
                </Text>
                <Progress
                  percent={percentage}
                  showInfo={false}
                  strokeColor="#faad14"
                  style={{ flex: 1 }}
                />
                <Text
                  className="count-label"
                  style={{
                    minWidth: '40px',
                    textAlign: 'right',
                    fontWeight: 500,
                    color: '#595959'
                  }}
                >
                  {count}
                </Text>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default RatingSummary;