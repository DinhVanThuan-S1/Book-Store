/**
 * ==============================================
 * BOOK LIST PAGE
 * ==============================================
 * Trang danh sách sách với filter
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Row, Col, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import BookList from '@components/book/BookList';
import BookFilter from '@components/book/BookFilter';
import { fetchBooks, setFilters } from '@redux/slices/bookSlice';
import { addToCart } from '@redux/slices/cartSlice';
import { showSuccess, showError } from '@utils/notification';
import './BookListPage.scss';

const { Content } = Layout;

const BookListPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux state
  const { books, pagination, filters, loading } = useSelector((state) => state.book);

  /**
   * Sync filters with URL params
   */
  useEffect(() => {
    const urlFilters = {
      category: searchParams.get('category') || null,
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || '-createdAt',
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null,
    };

    dispatch(setFilters(urlFilters));
  }, [searchParams, dispatch]);

  /**
   * Fetch books khi filters hoặc page thay đổi
   */
  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;

    dispatch(
      fetchBooks({
        ...filters,
        page,
        limit,
      })
    );
  }, [filters, searchParams, dispatch]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (newFilters) => {
    // Update URL params
    const params = new URLSearchParams();

    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key] !== null && newFilters[key] !== '') {
        params.set(key, newFilters[key]);
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

      showSuccess('Đã thêm vào giỏ hàng!');
    } catch (error) {
      showError(error || 'Không thể thêm vào giỏ hàng');
    }
  };

  return (
    <Layout className="book-list-page">
      <Content className="page-content">
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
      </Content>
    </Layout>
  );
};

export default BookListPage;