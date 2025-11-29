/**
 * ==============================================
 * REPORTS PAGE
 * ==============================================
 * Trang báo cáo thống kê chi tiết
 */

import React, { useState, useEffect } from 'react';
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
  Spin,
  message,
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
import dashboardApi from '@api/dashboardApi';
import dayjs from 'dayjs';
import './ReportsPage.scss';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [reportType, setReportType] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      productsSold: 0,
      newCustomers: 0,
    },
    revenueChart: [],
    topProducts: [],
  });

  /**
   * Fetch reports data
   */
  const fetchReports = async () => {
    try {
      setLoading(true);

      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await dashboardApi.getDetailedReports(params);

      if (response.success) {
        // Fill missing dates in chart
        const filledChart = fillMissingDates(
          response.data.revenueChart,
          dateRange[0],
          dateRange[1]
        );

        setReportData({
          ...response.data,
          revenueChart: filledChart,
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      message.error('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange, reportType]);

  /**
   * Fill missing dates in chart data
   */
  const fillMissingDates = (chartData, startDate, endDate) => {
    if (!startDate || !endDate) return chartData;

    const result = [];
    const dataMap = {};

    // Create map from existing data
    chartData.forEach(item => {
      dataMap[item.date] = item;
    });

    // Generate all dates in range
    let currentDate = dayjs(startDate);
    const end = dayjs(endDate);

    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
      const dateKey = currentDate.format('DD/MM');

      result.push({
        date: dateKey,
        revenue: dataMap[dateKey]?.revenue || 0,
        orders: dataMap[dateKey]?.orders || 0,
      });

      currentDate = currentDate.add(1, 'day');
    }

    return result;
  };

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  /**
   * Handle export reports
   */
  const handleExport = (type) => {
    message.info(`Đang xuất báo cáo dạng ${type}...`);
    // TODO: Implement export functionality
  };

  /**
   * Get chart config based on report type
   */
  const getChartConfig = () => {
    switch (reportType) {
      case 'revenue':
        return {
          title: 'Biểu đồ doanh thu',
          dataKey1: 'revenue',
          dataKey2: 'orders',
          label1: 'Doanh thu',
          label2: 'Đơn hàng',
          color1: '#8884d8',
          color2: '#82ca9d',
        };
      case 'orders':
        return {
          title: 'Biểu đồ đơn hàng',
          dataKey1: 'orders',
          dataKey2: null,
          label1: 'Số đơn hàng',
          label2: null,
          color1: '#1890ff',
          color2: null,
        };
      case 'products':
        return {
          title: 'Biểu đồ sản phẩm bán ra',
          dataKey1: 'orders',
          dataKey2: null,
          label1: 'Sản phẩm',
          label2: null,
          color1: '#faad14',
          color2: null,
        };
      case 'customers':
        return {
          title: 'Biểu đồ khách hàng mới',
          dataKey1: 'orders',
          dataKey2: null,
          label1: 'Khách hàng',
          label2: null,
          color1: '#cf1322',
          color2: null,
        };
      default:
        return {
          title: 'Biểu đồ doanh thu',
          dataKey1: 'revenue',
          dataKey2: 'orders',
          label1: 'Doanh thu',
          label2: 'Đơn hàng',
          color1: '#8884d8',
          color2: '#82ca9d',
        };
    }
  };

  const chartConfig = getChartConfig();

  // Calculate Y-axis ticks for revenue chart
  const getRevenueTicks = () => {
    if (reportType !== 'revenue' || reportData.revenueChart.length === 0) {
      return undefined;
    }

    const maxRevenue = Math.max(...reportData.revenueChart.map(item => item.revenue));
    const maxMillion = Math.ceil(maxRevenue / 500000) * 0.5; // Round up to nearest 0.5M
    const ticks = [];

    for (let i = 0; i <= maxMillion * 2; i++) {
      ticks.push(i * 500000); // 0, 0.5M, 1M, 1.5M, 2M...
    }

    return ticks;
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: '20%',
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold',
      key: 'sold',
      width: '15%',
      align: 'right',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      width: '25%',
      align: 'right',
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
        <Space size="middle" wrap>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            style={{ width: 300 }}
            format="DD/MM/YYYY"
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

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleExport('report')}
          >
            Xuất báo cáo
          </Button>

          <Button
            icon={<FileExcelOutlined />}
            onClick={() => handleExport('Excel')}
          >
            Excel
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={() => handleExport('PDF')}
          >
            PDF
          </Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {/* Summary Stats */}
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={reportData.summary.totalRevenue}
                formatter={(value) => formatPrice(value)}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng đơn hàng"
                value={reportData.summary.totalOrders}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Sản phẩm bán ra"
                value={reportData.summary.productsSold}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Khách hàng mới"
                value={reportData.summary.newCustomers}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title={chartConfig.title}>
              {reportData.revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={reportData.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(value) => {
                        if (reportType === 'revenue') {
                          return `${(value / 1000000).toFixed(1)}M`;
                        }
                        return Math.floor(value);
                      }}
                      allowDecimals={reportType === 'revenue'}
                      ticks={reportType === 'revenue' ? getRevenueTicks() : undefined}
                      domain={[0, 'auto']}
                    />
                    {chartConfig.dataKey2 && reportType === 'revenue' && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Đơn hàng', angle: -90, position: 'insideRight' }}
                        allowDecimals={false}
                      />
                    )}
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === chartConfig.dataKey1) {
                          if (reportType === 'revenue') {
                            return [formatPrice(value), chartConfig.label1];
                          }
                          return [value, chartConfig.label1];
                        }
                        if (chartConfig.dataKey2 && name === chartConfig.dataKey2) {
                          return [value, chartConfig.label2];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend
                      formatter={(value) => {
                        if (value === chartConfig.dataKey1) return chartConfig.label1;
                        if (value === chartConfig.dataKey2) return chartConfig.label2;
                        return value;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={chartConfig.dataKey1}
                      stroke={chartConfig.color1}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name={chartConfig.dataKey1}
                      yAxisId="left"
                    />
                    {chartConfig.dataKey2 && (
                      <Line
                        type="monotone"
                        dataKey={chartConfig.dataKey2}
                        stroke={chartConfig.color2}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name={chartConfig.dataKey2}
                        yAxisId="right"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                  Không có dữ liệu trong khoảng thời gian này
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Top Products */}
        <Card title="Top sản phẩm bán chạy" style={{ marginTop: 24 }}>
          <Table
            dataSource={reportData.topProducts}
            columns={columns}
            pagination={false}
            locale={{
              emptyText: 'Không có dữ liệu',
            }}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default ReportsPage;