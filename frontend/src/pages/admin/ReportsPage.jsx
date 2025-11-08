/**
 * ==============================================
 * REPORTS PAGE
 * ==============================================
 * Trang báo cáo thống kê chi tiết
 */

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Space,
  Typography,
  Statistic,
  Table,
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatPrice } from '@utils/formatPrice';
import './ReportsPage.scss';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState(null);
  const [reportType, setReportType] = useState('revenue');

  // Sample data
  const revenueData = [
    { date: '01/11', revenue: 15000000, orders: 45 },
    { date: '02/11', revenue: 18000000, orders: 52 },
    { date: '03/11', revenue: 22000000, orders: 68 },
    { date: '04/11', revenue: 19000000, orders: 55 },
    { date: '05/11', revenue: 25000000, orders: 72 },
    { date: '06/11', revenue: 21000000, orders: 61 },
  ];

  const topProducts = [
    {
      key: 1,
      name: 'Mắt biếc',
      category: 'Văn học',
      sold: 145,
      revenue: 12760000,
    },
    {
      key: 2,
      name: 'Đắc nhân tâm',
      category: 'Kỹ năng sống',
      sold: 132,
      revenue: 8976000,
    },
    {
      key: 3,
      name: 'Conan Tập 100',
      category: 'Truyện tranh',
      sold: 128,
      revenue: 2816000,
    },
  ];

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold',
      key: 'sold',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => formatPrice(revenue),
    },
  ];

  return (
    <div className="reports-page">
      <div className="page-header">
        <Title level={2}>Báo cáo & Thống kê</Title>
      </div>

      {/* Filters */}
      <Card className="filter-card">
        <Space size="middle">
          <RangePicker
            onChange={setDateRange}
            style={{ width: 300 }}
          />

          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: 200 }}
          >
            <Select.Option value="revenue">Doanh thu</Select.Option>
            <Select.Option value="orders">Đơn hàng</Select.Option>
            <Select.Option value="products">Sản phẩm</Select.Option>
            <Select.Option value="customers">Khách hàng</Select.Option>
          </Select>

          <Button type="primary" icon={<DownloadOutlined />}>
            Xuất báo cáo
          </Button>

          <Button icon={<FileExcelOutlined />}>Excel</Button>
          <Button icon={<FilePdfOutlined />}>PDF</Button>
        </Space>
      </Card>

      {/* Summary Stats */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={120000000}
              formatter={(value) => formatPrice(value)}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={353}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm bán ra"
              value={1247}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khách hàng mới"
              value={89}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Biểu đồ doanh thu">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(value)} />
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
      </Row>

      {/* Top Products */}
      <Card title="Top sản phẩm bán chạy" style={{ marginTop: 24 }}>
        <Table
          dataSource={topProducts}
          columns={columns}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default ReportsPage;