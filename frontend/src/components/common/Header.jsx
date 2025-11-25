/**
 * ==============================================
 * HEADER COMPONENT
 * ==============================================
 * Component header với navigation và cart icon
 */

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Layout,
  Menu,
  Badge,
  Dropdown,
  Avatar,
  Input,
  Button,
  Space,
} from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  LoginOutlined,
  LogoutOutlined,
  ProfileOutlined,
  HistoryOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { logoutUser } from '@redux/slices/authSlice';
import { fetchCart } from '@redux/slices/cartSlice';
import { showSuccess } from '@utils/notification';
import './Header.scss';

const { Header: AntHeader } = Layout;
const { Search } = Input;

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);

  // Fetch cart khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await dispatch(logoutUser());
    showSuccess('Đăng xuất thành công');
    navigate('/');
  };

  /**
   * Handle search
   */
  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/books?search=${encodeURIComponent(value)}`);
    }
  };

  /**
   * User menu items
   */
  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      icon: <HistoryOutlined />,
      label: 'Đơn hàng của tôi',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'wishlist',
      icon: <HeartOutlined />,
      label: 'Yêu thích',
      onClick: () => navigate('/wishlist'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <AntHeader className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">BookStore</span>
        </Link>

        {/* Navigation Menu */}
        <Menu
          mode="horizontal"
          className="header-menu"
          items={[
            {
              key: 'home',
              label: <Link to="/">Trang chủ</Link>,
            },
            {
              key: 'books',
              label: <Link to="/books">Sách</Link>,
            },
            {
              key: 'combos',
              label: <Link to="/combos">Combo</Link>,
            },
            {
              key: 'about',
              label: <Link to="/about">Giới thiệu</Link>,
            },
            {
              key: 'contact',
              label: <Link to="/contact">Liên hệ</Link>,
            },
          ]}
        />

        {/* Search Bar */}
        <div className="header-search">
          <Search
            placeholder="Tìm kiếm sách..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
          />
        </div>

        {/* Actions */}
        <Space size="large" className="header-actions">
          {/* Cart */}
          <Link to="/cart" className="header-cart">
            <Badge count={itemCount} showZero>
              <ShoppingCartOutlined style={{ fontSize: 24 }} />
            </Badge>
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="header-user">
                <Avatar
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  size="large"
                />
                <span className="user-name">{user?.fullName}</span>
              </div>
            </Dropdown>
          ) : (
            <Space>
              <Button
                type="default"
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                onClick={() => navigate('/register')}
              >
                Đăng ký
              </Button>
            </Space>
          )}
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;