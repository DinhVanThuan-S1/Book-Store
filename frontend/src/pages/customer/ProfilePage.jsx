/**
 * ==============================================
 * PROFILE PAGE
 * ==============================================
 * Trang thông tin cá nhân
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layout,
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Row,
  Col,
  Avatar,
  Upload,
  DatePicker,
  Radio,
  Space,
  Typography,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { updateUser } from '@redux/slices/authSlice';
import { authApi } from '@api';
import { showSuccess, showError } from '@utils/notification';
import './ProfilePage.scss';

const { Content } = Layout;
const { Title } = Typography;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Redux state
  const { user } = useSelector((state) => state.auth);

  /**
   * Handle update profile
   */
  const handleUpdateProfile = async (values) => {
    try {
      setUpdatingProfile(true);

      // TODO: Call API to update profile
      dispatch(updateUser(values));

      showSuccess('Cập nhật thông tin thành công');
    } catch (error) {
      showError(error || 'Không thể cập nhật thông tin');
    } finally {
      setUpdatingProfile(false);
    }
  };

  /**
   * Handle change password
   */
  const handleChangePassword = async (values) => {
    try {
      setChangingPassword(true);

      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      showSuccess('Đổi mật khẩu thành công');
      passwordForm.resetFields();
    } catch (error) {
      showError(error || 'Không thể đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };

  /**
   * Tabs
   */
  const tabItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      children: (
        <Card>
          <Form
            form={profileForm}
            layout="vertical"
            initialValues={{
              fullName: user?.fullName,
              email: user?.email,
              phone: user?.phone,
              dateOfBirth: user?.dateOfBirth ? dayjs(user.dateOfBirth) : null,
              gender: user?.gender,
            }}
            onFinish={handleUpdateProfile}
          >
            <Row gutter={24}>
              {/* Avatar */}
              <Col span={24} style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar size={120} src={user?.avatar} icon={<UserOutlined />} />
                <div style={{ marginTop: 16 }}>
                  <Upload showUploadList={false}>
                    <Button icon={<CameraOutlined />}>Đổi ảnh đại diện</Button>
                  </Upload>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item name="email" label="Email">
                  <Input size="large" disabled />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item name="dateOfBirth" label="Ngày sinh">
                  <DatePicker size="large" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="gender" label="Giới tính">
                  <Radio.Group>
                    <Radio value="male">Nam</Radio>
                    <Radio value="female">Nữ</Radio>
                    <Radio value="other">Khác</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={updatingProfile}
                >
                  Cập nhật thông tin
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      ),
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      children: (
        <Card>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
            style={{ maxWidth: 500 }}
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
                size="large"
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
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                size="large"
                placeholder="Nhập mật khẩu mới"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={['newPassword']}
              hasFeedback
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
                size="large"
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={changingPassword}
            >
              Đổi mật khẩu
            </Button>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <Layout className="profile-page">
      <Content className="page-content">
        <div className="container">
          <Title level={2} className="page-title">
            Thông tin tài khoản
          </Title>

          <Tabs defaultActiveKey="profile" items={tabItems} />
        </div>
      </Content>
    </Layout>
  );
};

export default ProfilePage;