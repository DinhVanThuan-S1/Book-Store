/**
 * ==============================================
 * ADMIN LAYOUT COMPONENT - COMPLETE VERSION
 * ==============================================
 * Layout chính cho admin dashboard với menu đầy đủ
 * Author: DinhVanThuan-S1
 * Date: 2025-11-19
 */

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Badge,
  Drawer,
} from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  ShoppingOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  FileTextOutlined,
  StarOutlined,
  TagsOutlined,
  EditOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { logoutUser } from '@redux/slices/authSlice';
import { showSuccess } from '@utils/notification';
import './AdminLayout.scss';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  // Redux state
  const { user } = useSelector((state) => state.auth);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await dispatch(logoutUser());
    showSuccess('Đăng xuất thành công');
    navigate('/admin/login');
  };

  /**
   * Menu items - COMPLETE VERSION
   */
  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => {
        navigate('/admin');
        setMobileDrawerVisible(false);
      },
    },
    {
      key: 'catalog',
      icon: <BookOutlined />,
      label: 'Quản lý sản phẩm',
      children: [
        {
          key: '/admin/books',
          icon: <BookOutlined />,
          label: 'Sách',
          onClick: () => {
            navigate('/admin/books');
            setMobileDrawerVisible(false);
          },
        },
        {
          key: '/admin/categories',
          icon: <TagsOutlined />,
          label: 'Danh mục',
          onClick: () => {
            navigate('/admin/categories');
            setMobileDrawerVisible(false);
          },
        },
        {
          key: '/admin/authors',
          icon: <EditOutlined />,
          label: 'Tác giả',
          onClick: () => {
            navigate('/admin/authors');
            setMobileDrawerVisible(false);
          },
        },
        {
          key: '/admin/publishers',
          icon: <HomeOutlined />,
          label: 'Nhà xuất bản',
          onClick: () => {
            navigate('/admin/publishers');
            setMobileDrawerVisible(false);
          },
        },
        {
          key: '/admin/combos',
          icon: <AppstoreOutlined />,
          label: 'Combo',
          onClick: () => {
            navigate('/admin/combos');
            setMobileDrawerVisible(false);
          },
        },
      ],
    },
    {
      key: '/admin/orders',
      icon: <ShoppingOutlined />,
      label: 'Quản lý đơn hàng',
      onClick: () => {
        navigate('/admin/orders');
        setMobileDrawerVisible(false);
      },
    },
    {
      key: '/admin/customers',
      icon: <UserOutlined />,
      label: 'Quản lý khách hàng',
      onClick: () => {
        navigate('/admin/customers');
        setMobileDrawerVisible(false);
      },
    },
    {
      key: '/admin/book-copies',
      icon: <FileTextOutlined />,
      label: 'Quản lý bản sao',
      onClick: () => {
        navigate('/admin/book-copies');
        setMobileDrawerVisible(false);
      },
    },
    {
      key: '/admin/reviews',
      icon: <StarOutlined />,
      label: 'Quản lý đánh giá',
      onClick: () => {
        navigate('/admin/reviews');
        setMobileDrawerVisible(false);
      },
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      onClick: () => {
        navigate('/admin/reports');
        setMobileDrawerVisible(false);
      },
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => {
        navigate('/admin/settings');
        setMobileDrawerVisible(false);
      },
    },
  ];

  /**
   * User menu items
   */
  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/admin/settings'),
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

  /**
   * Get selected keys from current path
   */
  const getSelectedKeys = () => {
    const path = location.pathname;

    // Check if in submenu
    if (path.startsWith('/admin/books') ||
      path.startsWith('/admin/categories') ||
      path.startsWith('/admin/authors') ||
      path.startsWith('/admin/publishers') ||
      path.startsWith('/admin/combos')) {
      return [path];
    }

    return [path];
  };

  /**
   * Get open keys for submenu
   */
  const getOpenKeys = () => {
    const path = location.pathname;

    if (path.startsWith('/admin/books') ||
      path.startsWith('/admin/categories') ||
      path.startsWith('/admin/authors') ||
      path.startsWith('/admin/publishers') ||
      path.startsWith('/admin/combos')) {
      return ['catalog'];
    }

    return [];
  };

  /**
   * Sidebar content
   */
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="admin-logo">
        <span className="logo-icon">📚</span>
        {!collapsed && <span className="logo-text">BookStore Admin</span>}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        className="admin-menu"
      />
    </>
  );

  return (
    <Layout className="admin-layout">
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        collapsedWidth={80}
        className="admin-sider desktop-sider"
        breakpoint="lg"
        onBreakpoint={(broken) => {
          // Auto collapse on small screens
          if (broken && !collapsed) {
            setCollapsed(true);
          }
        }}
      >
        {sidebarContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        className="mobile-drawer"
        width={250}
        bodyStyle={{ padding: 0 }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content Layout */}
      <Layout className="main-layout">
        {/* Header */}
        <Header className="admin-header">
          <div className="header-left">
            {/* Desktop Toggle Button */}
            <div
              className="trigger desktop-trigger"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>

            {/* Mobile Menu Button */}
            <div
              className="trigger mobile-trigger"
              onClick={() => setMobileDrawerVisible(true)}
            >
              <MenuUnfoldOutlined />
            </div>

            {/* Breadcrumb or Title */}
            <div className="page-title">
              <Text strong style={{ fontSize: 16 }}>
                {location.pathname === '/admin' && 'Dashboard'}
                {location.pathname === '/admin/profile' && 'Thông tin cá nhân'}
                {location.pathname === '/admin/books' && 'Quản lý sách'}
                {location.pathname === '/admin/categories' && 'Quản lý danh mục'}
                {location.pathname === '/admin/authors' && 'Quản lý tác giả'}
                {location.pathname === '/admin/publishers' && 'Quản lý nhà xuất bản'}
                {location.pathname === '/admin/combos' && 'Quản lý combo'}
                {location.pathname === '/admin/orders' && 'Quản lý đơn hàng'}
                {location.pathname === '/admin/customers' && 'Quản lý khách hàng'}
                {location.pathname === '/admin/book-copies' && 'Quản lý bản sao'}
                {location.pathname === '/admin/reviews' && 'Quản lý đánh giá'}
                {location.pathname === '/admin/reports' && 'Báo cáo'}
                {location.pathname === '/admin/settings' && 'Cài đặt'}
              </Text>
            </div>
          </div>

          <div className="header-right">
            {/* Notifications */}
            <Badge count={5} className="notification-badge">
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </Badge>

            {/* User Menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
              trigger={['click']}
            >
              <Space className="user-info" style={{ cursor: 'pointer' }}>
                <Avatar
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  size={40}
                />
                <div className="user-details">
                  <Text strong>{user?.fullName || 'Admin'}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Quản trị viên
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="admin-content">
          <Outlet />
        </Content>

        {/* Footer */}
        <div className="admin-footer">
          <Text type="secondary">
            © 2025 BookStore Admin Panel. Developed by DinhVanThuan-S1
          </Text>
        </div>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;