/**
 * ==============================================
 * HEADER COMPONENT
 * ==============================================
 * Component header với navigation và cart icon
 */

import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
import { useMessage } from '@utils/notification';
import './Header.scss';

const { Header: AntHeader } = Layout;
const { Search } = Input;

const Header = () => {
  const { message } = useMessage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

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
    message.success('Đăng xuất thành công');
    navigate('/');
  };

  /**
   * Handle search - Giữ lại filters hiện tại
   */
  const handleSearch = (value) => {
    // Lấy filters hiện tại từ URL (nếu đang ở trang books)
    const currentParams = new URLSearchParams(searchParams);

    if (value.trim()) {
      // Cập nhật search, giữ lại các params khác
      currentParams.set('search', value.trim());
      currentParams.set('page', '1'); // Reset về trang 1
    } else {
      // Xóa search nhưng giữ lại filters khác
      currentParams.delete('search');
      currentParams.set('page', '1');
    }

    navigate(`/books?${currentParams.toString()}`);
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
      label: 'Danh sách yêu thích',
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
          selectedKeys={[location.pathname.split('/')[1] || 'home']}
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
            placeholder="Tìm sách theo tên, tác giả..."
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
