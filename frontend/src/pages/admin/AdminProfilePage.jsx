/**
 * ==============================================
 * ADMIN PROFILE PAGE
 * ==============================================
 * Quản lý thông tin cá nhân admin
 * Author: DinhVanThuan-S1
 * Date: 2025-11-18
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  Row,
  Col,
  Divider,
  Typography,
  Space,
  Modal,
  message,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UploadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { updateUser } from '@redux/slices/authSlice';
import { authApi, uploadApi } from '@api';
import './AdminProfilePage.scss';

const { Title, Text } = Typography;

const AdminProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);

  /**
   * Handle update profile
   */
  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);

      // Prepare update data
      const updateData = {
        fullName: values.fullName,
        phone: values.phone,
      };

      // Upload avatar if changed
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const uploadResponse = await uploadApi.uploadImage(fileList[0].originFileObj);
        updateData.avatar = uploadResponse.data?.url || uploadResponse.url;
      }

      // Call API to update profile
      const response = await authApi.updateProfile(updateData);

      // Update Redux state
      dispatch(updateUser(response.data.admin || response.data.user));

      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      message.error(error?.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle change password
   */
  const handleChangePassword = async (values) => {
    try {
      setLoading(true);

      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success('Đổi mật khẩu thành công!');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error(error?.message || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle upload change
   */
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <div className="admin-profile-page">
      <div className="page-header">
        <Title level={2}>Thông tin cá nhân</Title>
        <Text type="secondary">Quản lý thông tin tài khoản của bạn</Text>
      </div>

      <Row gutter={24}>
        {/* Left Column - Avatar & Basic Info */}
        <Col xs={24} md={8}>
          <Card className="profile-card">
            <div className="avatar-section">
              <Avatar
                size={120}
                src={user?.avatar}
                icon={<UserOutlined />}
              />

              <Upload
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
                maxCount={1}
                listType="picture"
              >
                <Button icon={<UploadOutlined />} style={{ marginTop: 16 }}>
                  Đổi ảnh đại diện
                </Button>
              </Upload>
            </div>

            <Divider />

            <div className="info-section">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Email</Text>
                  <div>
                    <Text strong>{user?.email}</Text>
                  </div>
                </div>

                <div>
                  <Text type="secondary">Vai trò</Text>
                  <div>
                    <Text strong>Quản trị viên</Text>
                  </div>
                </div>

                <div>
                  <Text type="secondary">Trạng thái</Text>
                  <div>
                    <Text type="success" strong>Đang hoạt động</Text>
                  </div>
                </div>
              </Space>
            </div>

            <Divider />

            <Button
              type="default"
              icon={<LockOutlined />}
              block
              onClick={() => setPasswordModalVisible(true)}
            >
              Đổi mật khẩu
            </Button>
          </Card>
        </Col>

        {/* Right Column - Edit Form */}
        <Col xs={24} md={16}>
          <Card title="Cập nhật thông tin">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              initialValues={{
                fullName: user?.fullName,
                email: user?.email,
                phone: user?.phone,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[
                      { required: true, message: 'Vui lòng nhập họ tên!' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nhập họ và tên"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="email@example.com"
                      size="large"
                      disabled
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ!',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu mới"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Đổi mật khẩu
              </Button>
              <Button onClick={() => setPasswordModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProfilePage;