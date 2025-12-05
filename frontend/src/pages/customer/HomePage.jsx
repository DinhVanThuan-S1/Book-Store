/**
 * ==============================================
 * HOME PAGE
 * ==============================================
 * Trang chủ website
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Typography, Button, Carousel, Tag } from 'antd';
import { ArrowRightOutlined, StarFilled, ThunderboltOutlined } from '@ant-design/icons';
import BookList from '@components/book/BookList';
import Loading from '@components/common/Loading';
import { bookApi, categoryApi, comboApi, recommendationApi } from '@api';
import { addToCart } from '@redux/slices/cartSlice';
import { useMessage } from '@utils/notification';
import { formatPrice } from '@utils/formatPrice';
import './HomePage.scss';

const { Title, Paragraph } = Typography;

/**
 * HomePage Component
 */
const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { message } = useMessage();

  // Lấy thông tin authentication từ Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [personalizedBooks, setPersonalizedBooks] = useState([]); // Sách phù hợp với bạn
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

        // Fetch personalized recommendations (chỉ khi đã đăng nhập)
        if (isAuthenticated && user) {
          try {
            const recommendationResponse = await recommendationApi.getPersonalizedRecommendations({ limit: 8 });

            if (recommendationResponse.success && recommendationResponse.data.recommendations) {
              const recommendations = recommendationResponse.data.recommendations || [];
              // Extract book data from recommendations
              const books = recommendations.map(rec => rec.book).filter(Boolean);
              setPersonalizedBooks(books);
            }
          } catch (error) {
            console.log('No personalized recommendations available:', error.message);
            setPersonalizedBooks([]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

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
                onClick={() => navigate('/combos')}
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

      {/* Personalized Recommendations - Sách phù hợp với bạn */}
      {isAuthenticated && personalizedBooks.length > 0 && (
        <section className="personalized-section">
          <div className="container">
            <div className="section-header">
              <div className="section-title-wrapper">
                <StarFilled className="section-icon" />
                <Title level={2} className="section-title">
                  Sách phù hợp với bạn
                </Title>
                <Tag color="blue" style={{ marginLeft: '12px' }}>
                  Dựa trên sở thích của bạn
                </Tag>
              </div>
            </div>

            <BookList
              books={personalizedBooks}
              onAddToCart={handleAddToCart}
            />
          </div>
        </section>
      )}

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
