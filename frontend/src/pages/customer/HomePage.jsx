/**
 * ==============================================
 * HOME PAGE
 * ==============================================
 * Trang chủ website
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Row, Col, Typography, Button, Carousel } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import BookList from '@components/book/BookList';
import Loading from '@components/common/Loading';
import { bookApi, categoryApi, comboApi } from '@api';
import { addToCart } from '@redux/slices/cartSlice';
import { showSuccess, showError } from '@utils/notification';
import { formatPrice } from '@utils/formatPrice';
import './HomePage.scss';

const { Title, Paragraph } = Typography;

/**
 * HomePage Component
 */
const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [combos, setCombos] = useState([]);

  /**
   * Fetch data
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoryResponse = await categoryApi.getCategories();
        setCategories(categoryResponse.data.categories || []);

        // Fetch featured books (bán chạy)
        const featuredResponse = await bookApi.getBooks({
          sortBy: '-purchaseCount',
          limit: 8,
        });
        setFeaturedBooks(featuredResponse.data.books || []);

        // Fetch new books
        const newResponse = await bookApi.getBooks({
          sortBy: '-createdAt',
          limit: 8,
        });
        setNewBooks(newResponse.data.books || []);

        // Fetch combos
        const comboResponse = await comboApi.getCombos({
          limit: 4,
        });
        setCombos(comboResponse.data.combos || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-section">
        <Carousel autoplay effect="fade" className="hero-carousel">
          <div className="hero-slide hero-slide-1">
            <div className="hero-content">
              <Title level={1}>Khám phá thế giới tri thức</Title>
              <Paragraph style={{ color: '#ffffff', fontWeight: 200, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                Hàng nghìn đầu sách chất lượng với giá tốt nhất
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/books')}
              >
                Khám phá ngay
              </Button>
            </div>
          </div>

          <div className="hero-slide hero-slide-2">
            <div className="hero-content">
              <Title level={1}>Ưu đãi hấp dẫn</Title>
              <Paragraph style={{ color: '#ffffff', fontWeight: 200, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                Giảm giá lên đến 50% cho hàng nghìn đầu sách
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/books?sortBy=-discountPercent')}
              >
                Xem ưu đãi
              </Button>
            </div>
          </div>

          <div className="hero-slide hero-slide-3">
            <div className="hero-content">
              <Title level={1}>Miễn phí vận chuyển</Title>
              <Paragraph style={{ color: '#ffffff', fontWeight: 200, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                Cho đơn hàng từ 300.000đ trên toàn quốc
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/books')}
              >
                Mua sắm ngay
              </Button>
            </div>
          </div>
        </Carousel>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <Title level={2} className="section-title">
            Danh mục sách
          </Title>

          <Row gutter={[16, 16]}>
            {categories.slice(0, 6).map((category) => (
              <Col key={category._id} xs={12} sm={8} md={4}>
                <div
                  className="category-card"
                  onClick={() => navigate(`/books?category=${category._id}`)}
                >
                  <div className="category-image">
                    <img src={category.image} alt={category.name} />
                  </div>
                  <div className="category-name">{category.name}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Featured Books */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <Title level={2} className="section-title">
              Sách bán chạy
            </Title>
            <Button
              type="link"
              onClick={() => navigate('/books?sortBy=-purchaseCount')}
            >
              Xem tất cả <ArrowRightOutlined />
            </Button>
          </div>

          <BookList
            books={featuredBooks}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      {/* Combos */}
      {combos.length > 0 && (
        <section className="combo-section">
          <div className="container">
            <div className="section-header">
              <Title level={2} className="section-title">
                Sale siêu khủng
              </Title>
              <Button
                type="link"
                onClick={() => navigate('/combos')}
              >
                Xem tất cả <ArrowRightOutlined />
              </Button>
            </div>

            <Row gutter={[16, 16]}>
              {combos.map((combo) => {
                const discount = combo.totalOriginalPrice - combo.comboPrice;
                const percent = Math.round((discount / combo.totalOriginalPrice) * 100);

                return (
                  <Col key={combo._id} xs={24} sm={12} lg={6}>
                    <div className="combo-card" onClick={() => navigate(`/combos/${combo._id}`)}>
                      <div className="combo-image">
                        <img src={combo.image} alt={combo.name} />
                        <div className="combo-discount">-{percent}%</div>
                      </div>
                      <div className="combo-info">
                        <h3>{combo.name}</h3>
                        <p className="combo-books">{combo.books.length} sách</p>
                        <div className="combo-price">
                          <span className="original-price">{formatPrice(combo.totalOriginalPrice)}</span>
                          <span className="sale-price">{formatPrice(combo.comboPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>
        </section>
      )}

      {/* New Books */}
      <section className="new-books-section">
        <div className="container">
          <div className="section-header">
            <Title level={2} className="section-title">
              Sách mới phát hành
            </Title>
            <Button
              type="link"
              onClick={() => navigate('/books?sortBy=-createdAt')}
            >
              Xem tất cả <ArrowRightOutlined />
            </Button>
          </div>

          <BookList
            books={newBooks}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;