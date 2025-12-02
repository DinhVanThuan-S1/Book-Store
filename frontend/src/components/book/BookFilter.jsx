/**
 * ==============================================
 * BOOK FILTER COMPONENT
 * ==============================================
 * Component sidebar filter cho sách
 */

import React, { useState, useEffect } from 'react';
import { Card, Select, Slider, Button, Divider, Space, Radio } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { categoryApi } from '@api';
import { SORT_OPTIONS, PRICE_RANGES } from '@constants/appConstants';
import { formatPrice } from '@utils/formatPrice';
import './BookFilter.scss';

const { Option } = Select;

/**
 * BookFilter Component
 * @param {Object} props
 * @param {Object} props.filters - Current filters
 * @param {Function} props.onFilterChange - Callback khi filter thay đổi
 */
const BookFilter = ({ filters = {}, onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);

  /**
   * Fetch categories
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategories();
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  /**
   * Handle filter change
   */
  const handleFilterChange = (key, value) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [key]: value });
    }
  };

  /**
   * Handle price range change
   */
  const handlePriceChange = (range) => {
    setPriceRange(range);
  };

  /**
   * Apply price filter
   */
  const applyPriceFilter = () => {
    handleFilterChange('minPrice', priceRange[0]);
    handleFilterChange('maxPrice', priceRange[1]);
  };

  /**
   * Clear all filters (giữ lại search)
   */
  const clearFilters = () => {
    setPriceRange([0, 1000000]);
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        category: null,
        minPrice: null,
        maxPrice: null,
        sortBy: '-createdAt',
      });
    }
  };

  return (
    <Card
      title={
        <Space>
          <FilterOutlined />
          <span>Bộ lọc</span>
        </Space>
      }
      extra={
        <Button
          type="text"
          size="small"
          icon={<ClearOutlined />}
          onClick={clearFilters}
        >
          Xóa
        </Button>
      }
      className="book-filter"
    >
      {/* Sort */}
      <div className="filter-section">
        <h4 className="filter-title">Sắp xếp</h4>
        <Select
          style={{ width: '100%' }}
          value={filters.sortBy || '-createdAt'}
          onChange={(value) => handleFilterChange('sortBy', value)}
        >
          {SORT_OPTIONS.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>

      <Divider />

      {/* Category */}
      <div className="filter-section">
        <h4 className="filter-title">Danh mục</h4>
        <Radio.Group
          value={filters.category || null}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio value={null}>Tất cả</Radio>
            {categories.map((category) => (
              <Radio key={category._id} value={category._id}>
                {category.name}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>

      <Divider />

      {/* Price Range */}
      <div className="filter-section">
        <h4 className="filter-title">Khoảng giá</h4>

        {/* Quick price ranges */}
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          {PRICE_RANGES.map((range, index) => (
            <Button
              key={index}
              type={
                filters.minPrice === range.min &&
                  filters.maxPrice === range.max
                  ? 'primary'
                  : 'default'
              }
              block
              onClick={() => {
                handleFilterChange('minPrice', range.min);
                handleFilterChange('maxPrice', range.max);
              }}
            >
              {range.label}
            </Button>
          ))}
        </Space>

        {/* Custom range slider */}
        <div className="price-slider">
          <Slider
            range
            min={0}
            max={1000000}
            step={10000}
            value={priceRange}
            onChange={handlePriceChange}
            onAfterChange={applyPriceFilter}
            tooltip={{
              formatter: (value) => formatPrice(value),
            }}
          />
          <div className="price-range-text">
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BookFilter;