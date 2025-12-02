/**
 * ==============================================
 * CART PAGE
 * ==============================================
 * Trang giỏ hàng
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Breadcrumb, Empty, Button } from 'antd';
import { HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
import CartItem from '@components/cart/CartItem';
import CartSummary from '@components/cart/CartSummary';
import Loading from '@components/common/Loading';
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
} from '@redux/slices/cartSlice';
import { useMessage } from '@utils/notification';
import './CartPage.scss';

const CartPage = () => {
  const { message } = useMessage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { items, totalPrice, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  /**
   * Fetch cart
   */
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  /**
   * Handle update quantity
   */
  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap();
      message.success('Đã cập nhật số lượng');
    } catch (error) {
      message.error(error || 'Không thể cập nhật');
    }
  };

  /**
   * Handle remove item
   */
  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeCartItem(itemId)).unwrap();
      message.success('Đã xóa khỏi giỏ hàng');
    } catch (error) {
      message.error(error || 'Không thể xóa');
    }
  };

  /**
   * Handle checkout
   */
  const handleCheckout = () => {
    if (items.length === 0) {
      message.error('Giỏ hàng trống');
      return;
    }

    navigate('/checkout');
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="page-content">
          <div className="container">
            <Empty
              description="Vui lòng đăng nhập để xem giỏ hàng"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
            </Empty>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return <Loading fullScreen />;
  }

  // Empty cart
  if (!items || items.length === 0) {
    return (
      <div className="cart-page">
        <div className="page-content">
          <div className="container">
            <Empty
              description="Giỏ hàng trống"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/books')}
              >
                Tiếp tục mua sắm
              </Button>
            </Empty>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary
  const shippingFee = totalPrice >= 300000 ? 0 : 25000;
  const total = totalPrice + shippingFee;

  // Calculate savings (originalPrice - salePrice)
  const savings = items.reduce((acc, item) => {
    if (item.type === 'book' && item.book) {
      const originalPrice = item.book.originalPrice || item.price;
      const saved = (originalPrice - item.price) * item.quantity;
      return acc + saved;
    }
    return acc;
  }, 0);

  return (
    <div className="cart-page">
      <div className="page-content">
        <div className="container">
          {/* Breadcrumb */}
          <Breadcrumb
            className="page-breadcrumb"
            items={[
              {
                href: '/',
                title: <HomeOutlined />,
              },
              {
                title: 'Giỏ hàng',
              },
            ]}
          />

          {/* Content */}
          <Row gutter={24}>
            {/* Cart Items */}
            <Col xs={24} md={16}>
              <div className="cart-items">
                <h2 className="section-title">
                  Giỏ hàng của bạn ({items.length} sản phẩm)
                </h2>

                {items.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </Col>

            {/* Summary */}
            <Col xs={24} md={8}>
              <CartSummary
                subtotal={totalPrice}
                shippingFee={shippingFee}
                savings={savings}
                total={total}
                onCheckout={handleCheckout}
              />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

