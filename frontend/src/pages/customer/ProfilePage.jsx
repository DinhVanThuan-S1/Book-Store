/**
 * ==============================================
 * PROFILE PAGE
 * ==============================================
 * Trang thông tin cá nhân
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
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
  List,
  Tag,
  Popconfirm,
  Modal,
  Divider,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  CameraOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { updateUser } from '@redux/slices/authSlice';
import { authApi, uploadApi, addressApi } from '@api';
import { useMessage } from '@utils/notification';
import AddressForm from '@components/address/AddressForm';
import './ProfilePage.scss';

const { Title } = Typography;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { message } = useMessage(); // ⭐ Sử dụng hook thay vì static functions
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressFormVisible, setAddressFormVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Redux state
  const { user } = useSelector((state) => state.auth);

  /**
   * Fetch addresses on mount
   */
  useEffect(() => {
    fetchAddresses();
  }, []);

  /**
   * Fetch addresses
   */
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await addressApi.getMyAddresses();
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Fetch addresses error:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  /**
   * Handle update profile
   */
  const handleUpdateProfile = async (values) => {
    try {
      setUpdatingProfile(true);

      // Loại bỏ email (không cho phép update) và convert dateOfBirth
      const { email: _email, ...updateFields } = values;

      // Clean data: chỉ gửi các field có giá trị
      const updateData = {};

      if (updateFields.fullName) updateData.fullName = updateFields.fullName;
      if (updateFields.phone) updateData.phone = updateFields.phone;
      if (updateFields.dateOfBirth) {
        // Format YYYY-MM-DD để tránh lỗi timezone
        updateData.dateOfBirth = updateFields.dateOfBirth.format('YYYY-MM-DD');
      }
      if (updateFields.gender) updateData.gender = updateFields.gender;

      console.log('Update data:', updateData); // Debug

      // Call API to update profile
      const response = await authApi.updateProfile(updateData);
      console.log('Update response:', response); // Debug

      // Update Redux state với data từ server
      dispatch(updateUser(response.data.user));

      message.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Update profile error:', error); // Debug
      console.error('Error response data:', error?.response?.data); // Debug chi tiết

      // Hiển thị lỗi chi tiết từ server
      if (error?.response?.data) {
        const data = error.response.data;
        console.error('Server response:', data);

        if (Array.isArray(data.errors) && data.errors.length > 0) {
          // Log từng lỗi để debug
          console.error('Validation errors:', data.errors);
          data.errors.forEach((err) => {
            message.error(`${err.field || err.param || 'Error'}: ${err.message || err.msg}`);
          });
        } else if (data.message) {
          message.error(data.message);
        } else {
          message.error('Không thể cập nhật thông tin');
        }
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error('Không thể cập nhật thông tin');
      }
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

      message.success('Đổi mật khẩu thành công');
      passwordForm.resetFields();
    } catch (error) {
      message.error(error || 'Không thể đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };

  /**
   * Handle avatar upload
   */
  const handleAvatarUpload = async (file) => {
    // Validate file
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được upload file ảnh!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    try {
      setUploadingAvatar(true);

      // Upload to Cloudinary
      const response = await uploadApi.uploadImage(file);
      const avatarUrl = response.data?.url || response.url;

      if (!avatarUrl) {
        throw new Error('Upload failed: No URL returned');
      }

      // Update profile with new avatar
      const updateData = { avatar: avatarUrl };
      await authApi.updateProfile(updateData);

      // Update Redux state
      dispatch(updateUser({ ...user, avatar: avatarUrl }));

      message.success('Đổi ảnh đại diện thành công!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      message.error(error?.message || 'Không thể upload ảnh');
    } finally {
      setUploadingAvatar(false);
    }

    return false; // Prevent default upload behavior
  };

  /**
   * Handle create/edit address
   */
  const handleAddressModal = (address = null) => {
    setEditingAddress(address);
    setAddressFormVisible(true);
  };

  /**
   * Handle save address success
   */
  const handleAddressSuccess = () => {
    message.success(editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công');
    setAddressFormVisible(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  /**
   * Handle delete address
   */
  const handleDeleteAddress = async (id) => {
    try {
      await addressApi.deleteAddress(id);
      message.success('Xóa địa chỉ thành công');
      fetchAddresses();
    } catch (error) {
      message.error(error?.message || 'Không thể xóa địa chỉ');
    }
  };

  /**
   * Handle set default address
   */
  const handleSetDefaultAddress = async (id) => {
    try {
      await addressApi.setDefaultAddress(id);
      message.success('Đặt địa chỉ mặc định thành công');
      fetchAddresses();
    } catch (error) {
      message.error(error?.message || 'Không thể đặt địa chỉ mặc định');
    }
  };

  /**
   * Get location type display
   */
  const getLocationTypeDisplay = (type) => {
    const types = {
      home: { icon: <HomeOutlined />, text: 'Nhà ở' },
      office: { icon: <ShopOutlined />, text: 'Văn phòng' },
      other: { icon: <EnvironmentOutlined />, text: 'Khác' },
    };
    return types[type] || types.other;
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
                  <Upload
                    showUploadList={false}
                    beforeUpload={handleAvatarUpload}
                    accept="image/*"
                  >
                    <Button
                      icon={<CameraOutlined />}
                      loading={uploadingAvatar}
                    >
                      {uploadingAvatar ? 'Đang upload...' : 'Đổi ảnh đại diện'}
                    </Button>
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
    {
      key: 'addresses',
      label: 'Địa chỉ',
      children: (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAddressModal()}
            >
              Thêm địa chỉ mới
            </Button>
          </div>

          <List
            loading={loadingAddresses}
            dataSource={addresses}
            locale={{ emptyText: 'Chưa có địa chỉ nào' }}
            renderItem={(address) => (
              <List.Item
                actions={[
                  !address.isDefault && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleSetDefaultAddress(address._id)}
                    >
                      Đặt làm mặc định
                    </Button>
                  ),
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleAddressModal(address)}
                  >
                    Sửa
                  </Button>,
                  <Popconfirm
                    title="Xóa địa chỉ này?"
                    onConfirm={() => handleDeleteAddress(address._id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ fontSize: 24 }}>
                      {getLocationTypeDisplay(address.addressType)?.icon || <EnvironmentOutlined />}
                    </div>
                  }
                  title={
                    <Space>
                      <span>{address.recipientName}</span>
                      <span>|</span>
                      <span>{address.phone}</span>
                      {address.addressType && (
                        <Tag>{getLocationTypeDisplay(address.addressType)?.text}</Tag>
                      )}
                      {address.isDefault && (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                          Mặc định
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <div>{address.detailAddress}</div>
                      <div style={{ color: '#999' }}>
                        {[address.ward, address.district, address.province]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ),
    },
  ];

  return (
    <div className="profile-page">
      <div className="page-content">
        <div className="container">
          <Title level={2} className="page-title">
            Thông tin tài khoản
          </Title>

          <Tabs defaultActiveKey="profile" items={tabItems} />
        </div>
      </div>

      {/* Address Form Modal */}
      <AddressForm
        visible={addressFormVisible}
        onCancel={() => {
          setAddressFormVisible(false);
          setEditingAddress(null);
        }}
        onSuccess={handleAddressSuccess}
        address={editingAddress}
      />
    </div>
  );
};

export default ProfilePage;
