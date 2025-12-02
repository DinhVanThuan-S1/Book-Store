/**
 * ==============================================
 * SETTINGS PAGE (Admin)
 * ==============================================
 * Trang cài đặt hệ thống
 */

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Upload,
  message,
} from 'antd';
import {
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import './SettingsPage.scss';

const { Title, Text } = Typography;

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async (values) => {
    try {
      setLoading(true);
      // TODO: Call API to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Đã lưu cài đặt thành công');
    } catch (error) {
      message.error('Không thể lưu cài đặt', error.message, values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <Title level={2}>Cài đặt hệ thống</Title>
        <Text type="secondary">Cấu hình chung cho website</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          siteName: 'BookStore',
          siteDescription: 'Cửa hàng sách trực tuyến',
          contactEmail: 'support@bookstore.vn',
          contactPhone: '0123 456 789',
          freeShippingThreshold: 300000,
          defaultShippingFee: 25000,
          enableReviews: true,
          enableWishlist: true,
          enableNotifications: true,
          maintenanceMode: false,
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Thông tin chung" style={{ marginBottom: 24 }}>
              <Form.Item
                name="siteName"
                label="Tên website"
                rules={[{ required: true }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                name="siteDescription"
                label="Mô tả"
              >
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item
                name="siteLogo"
                label="Logo website"
              >
                <Upload>
                  <Button icon={<UploadOutlined />}>
                    Tải lên logo
                  </Button>
                </Upload>
              </Form.Item>
            </Card>

            <Card title="Thông tin liên hệ">
              <Form.Item
                name="contactEmail"
                label="Email liên hệ"
                rules={[{ type: 'email' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="contactPhone"
                label="Số điện thoại"
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="contactAddress"
                label="Địa chỉ"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Cài đặt vận chuyển" style={{ marginBottom: 24 }}>
              <Form.Item
                name="freeShippingThreshold"
                label="Miễn phí ship từ"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="₫"
                />
              </Form.Item>

              <Form.Item
                name="defaultShippingFee"
                label="Phí ship mặc định"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="₫"
                />
              </Form.Item>
            </Card>

            <Card title="Tính năng">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="enableReviews"
                  label="Cho phép đánh giá"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="enableWishlist"
                  label="Cho phép wishlist"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="enableNotifications"
                  label="Thông báo email"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Divider />

                <Form.Item
                  name="maintenanceMode"
                  label="Chế độ bảo trì"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 24 }}>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={loading}
            >
              Lưu cài đặt
            </Button>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};

export default SettingsPage;