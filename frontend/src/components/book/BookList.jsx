/**
 * ==============================================
 * BOOK LIST COMPONENT
 * ==============================================
 * Component hiển thị danh sách sách dạng grid
 */

import React from 'react';
import { Row, Col, Empty, Pagination } from 'antd';
import BookCard from './BookCard';
import Loading from '@components/common/Loading';
import './BookList.scss';

/**
 * BookList Component
 * @param {Object} props
 * @param {Array} props.books - Danh sách sách
 * @param {Boolean} props.loading - Loading state
 * @param {Object} props.pagination - { page, limit, total, pages }
 * @param {Function} props.onPageChange - Callback khi đổi trang
 * @param {Function} props.onAddToCart - Callback khi thêm vào giỏ
 */
const BookList = ({
  books = [],
  loading = false,
  pagination = {},
  onPageChange,
  onAddToCart,
}) => {
  /**
   * Handle page change
   */
  const handlePageChange = (page, pageSize) => {
    if (onPageChange) {
      onPageChange(page, pageSize);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return <Loading />;
  }

  // Empty state
  if (!books || books.length === 0) {
    return (
      <div className="book-list-empty">
        <Empty
          description="Không tìm thấy sách nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="book-list">
      <Row gutter={[16, 24]}>
        {books.map((book) => (
          <Col
            key={book._id}
            xs={12}
            sm={12}
            md={8}
            lg={6}
            xl={6}
          >
            <BookCard book={book} onAddToCart={onAddToCart} />
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="book-list-pagination">
          <Pagination
            current={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger
            showTotal={(total) => `Tổng ${total} sách`}
            pageSizeOptions={[12, 24, 36, 48]}
          />
        </div>
      )}
    </div>
  );
};

export default BookList;