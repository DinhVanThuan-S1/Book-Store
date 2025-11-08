/**
 * ==============================================
 * ADMIN LAYOUT COMPONENT - FIXED
 * ==============================================
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
   * Menu items
   */
  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin'),
    },
    {
      key: '/admin/books',
      icon: <BookOutlined />,
      label: 'Quản lý sách',
      onClick: () => navigate('/admin/books'),
    },
    {
      key: '/admin/orders',
      icon: <ShoppingOutlined />,
      label: 'Quản lý đơn hàng',
      onClick: () => navigate('/admin/orders'),
    },
    {
      key: '/admin/customers',
      icon: <UserOutlined />,
      label: 'Quản lý khách hàng',
      onClick: () => navigate('/admin/customers'),
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      onClick: () => navigate('/admin/reports'),
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/admin/settings'),
    },
  ];

  /**
   * User menu items
   */
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
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

  // Get current selected key
  const selectedKey = location.pathname;

  return (
    <Layout className="admin-layout">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        collapsedWidth={80}
        className="admin-sider"
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        {/* Logo */}
        <div className="admin-logo">
          <span className="logo-icon">📚</span>
          {!collapsed && <span className="logo-text">Admin Panel</span>}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="admin-menu"
        />
      </Sider>

      {/* Main Content Layout */}
      <Layout>
        {/* Header */}
        <Header className="admin-header">
          <div className="header-left">
            {/* Toggle Button */}
            <div
              className="trigger"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
          </div>

          <div className="header-right">
            {/* Notifications */}
            <Badge count={5} className="notification-badge">
              <BellOutlined style={{ fontSize: 20 }} />
            </Badge>

            {/* User Menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space className="user-info">
                <Avatar
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  size={40}
                />
                {!collapsed && (
                  <div className="user-details">
                    <Text strong>{user?.fullName || 'Admin'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Quản trị viên
                    </Text>
                  </div>
                )}
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;