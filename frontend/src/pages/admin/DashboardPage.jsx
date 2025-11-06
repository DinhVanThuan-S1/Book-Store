/**
 * ==============================================
 * ADMIN DASHBOARD PAGE
 * ==============================================
 * Trang dashboard với thống kê tổng quan
 * Author: DinhVanThuan-S1
 * Date: 2025-11-04
 */

import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Space,
  Tag,
  DatePicker,
  Select,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  BookOutlined,
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '@api';
import { formatPrice } from '@utils/formatPrice';
import { formatDate } from '@utils/formatDate';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@constants/appConstants';
import Loading from '@components/common/Loading';
import './DashboardPage.scss';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  /**
   * Fetch dashboard data
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch overview stats
        const overviewRes = await dashboardApi.getOverviewStats();
        setOverviewStats(overviewRes.data);


        // Fetch revenue data (last 30 days)
        const revenueRes = await dashboardApi.getRevenueStats({ groupBy: 'day' });
        setRevenueData(revenueRes.data.stats || []);

        // Fetch top books
        const booksRes = await dashboardApi.getTopBooks(5);
        setTopBooks(booksRes.data.books || []);

        // Fetch order stats
        const orderStatsRes = await dashboardApi.getOrderStats();
        setOrderStats(orderStatsRes.data.stats || []);

        // Fetch recent orders (using order API)
        const ordersRes = await dashboardApi.getRecentOrders({ page: 1, limit: 10 });
        setRecentOrders(ordersRes.data.data.orders || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !overviewStats) {
    return <Loading />;
  }

  /**
   * Stat cards data
   */
  const statCards = [
    {
      title: 'Tổng sách',
      value: overviewStats.totalBooks,
      prefix: <BookOutlined />,
      valueStyle: { color: '#3f8600' },
      icon: BookOutlined,
      color: '#52c41a',
    },
    {
      title: 'Khách hàng',
      value: overviewStats.totalCustomers,
      prefix: <UserOutlined />,
      valueStyle: { color: '#1890ff' },
      icon: UserOutlined,
      color: '#1890ff',
    },
    {
      title: 'Đơn hàng',
      value: overviewStats.totalOrders,
      prefix: <ShoppingOutlined />,
      valueStyle: { color: '#faad14' },
      icon: ShoppingOutlined,
      color: '#faad14',
    },
    {
      title: 'Doanh thu tháng',
      value: formatPrice(overviewStats.monthlyRevenue),
      prefix: <DollarOutlined />,
      valueStyle: { color: '#cf1322' },
      icon: DollarOutlined,
      color: '#cf1322',
    },
  ];

  /**
   * Recent orders table columns
   */
  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => customer?.fullName || 'N/A',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => formatPrice(price),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={ORDER_STATUS_COLORS[status]}>
          {ORDER_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
  ];

  /**
   * Top books table columns
   */
  const bookColumns = [
    {
      title: 'Sách',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Space>
          <img
            src={record.images?.[0]}
            alt={title}
            style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 4 }}
          />
          <div>
            <Text strong>{title}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.author?.name}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'purchaseCount',
      key: 'purchaseCount',
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: 'Giá',
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (price) => formatPrice(price),
    },
  ];

  /**
   * Chart colors
   */
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="dashboard-page">
      {/* Page Title */}
      <div className="page-header">
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Tổng quan hệ thống</Text>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="stat-card" hoverable>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={stat.valueStyle}
                prefix={<stat.icon style={{ fontSize: 24 }} />}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Revenue Chart */}
        <Col xs={24} lg={16}>
          <Card title="Doanh thu 30 ngày qua">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatPrice(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Order Status Chart */}
        <Col xs={24} lg={8}>
          <Card title="Trạng thái đơn hàng">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry._id}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {orderStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row gutter={[16, 16]}>
        {/* Top Books */}
        <Col xs={24} lg={12}>
          <Card title="Sách bán chạy">
            <Table
              dataSource={topBooks}
              columns={bookColumns}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng gần đây">
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Pending Orders Alert */}
      {overviewStats.pendingOrders > 0 && (
        <Card
          style={{ marginTop: 24, background: '#fff7e6', borderColor: '#ffa940' }}
        >
          <Space>
            <ShoppingOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
            <div>
              <Text strong>Có {overviewStats.pendingOrders} đơn hàng đang chờ xử lý</Text>
              <br />
              <Text type="secondary">Vui lòng xác nhận đơn hàng sớm nhất có thể</Text>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;