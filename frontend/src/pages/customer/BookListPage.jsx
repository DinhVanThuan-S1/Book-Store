/**
 * ==============================================
 * BOOK LIST PAGE
 * ==============================================
 * Trang danh sách sách với filter
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import BookList from '@components/book/BookList';
import BookFilter from '@components/book/BookFilter';
import { fetchBooks, setFilters } from '@redux/slices/bookSlice';
import { addToCart } from '@redux/slices/cartSlice';
import { useMessage } from '@utils/notification';
import './BookListPage.scss';


const BookListPage = () => {
  const { message } = useMessage();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux state
  const { books, pagination, filters, loading } = useSelector((state) => state.book);

  /**
   * Sync filters with URL params và fetch books
   */
  useEffect(() => {
    const urlFilters = {
      category: searchParams.get('category') || null,
      author: searchParams.get('author') || null,
      publisher: searchParams.get('publisher') || null,
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || '-createdAt',
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null,
    };

    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;

    // Set filters trước
    dispatch(setFilters(urlFilters));

    // Sau đó fetch books NGAY với filters từ URL (không dùng filters từ Redux)
    dispatch(
      fetchBooks({
        ...urlFilters,
        page,
        limit,
      })
    );
  }, [searchParams, dispatch]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (newFilters) => {
    // Update URL params
    const params = new URLSearchParams();

    // Merge filters với filters hiện tại để giữ lại search
    const allFilters = { ...filters, ...newFilters };

    Object.keys(allFilters).forEach((key) => {
      if (allFilters[key] !== null && allFilters[key] !== '' && allFilters[key] !== undefined) {
        params.set(key, allFilters[key]);
      }
    });

    params.set('page', '1'); // Reset về trang 1
    setSearchParams(params);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page, pageSize) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    params.set('limit', pageSize);
    setSearchParams(params);
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = async (book) => {
    try {
      await dispatch(
        addToCart({
          type: 'book',
          bookId: book._id,
          quantity: 1,
        })
      ).unwrap();

      message.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      message.error(error || 'Không thể thêm vào giỏ hàng');
    }
  };

  return (
    <div className="book-list-page">
      <div className="page-content">
        <div className="container">
          {/* Breadcrumb */}
          <Breadcrumb className="page-breadcrumb">
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Danh sách sách</Breadcrumb.Item>
          </Breadcrumb>

          {/* Content */}
          <Row gutter={24}>
            {/* Filter Sidebar */}
            <Col xs={24} md={6}>
              <BookFilter
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </Col>

            {/* Book List */}
            <Col xs={24} md={18}>
              <BookList
                books={books}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                onAddToCart={handleAddToCart}
              />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default BookListPage;

