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
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { updateUser } from '@redux/slices/authSlice';
import { authApi, uploadApi, addressApi } from '@api';
import { showSuccess, showError } from '@utils/notification';
import './ProfilePage.scss';

const { Title } = Typography;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [addressForm] = Form.useForm();

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

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
      const updateData = {
        ...updateFields,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
      };

      console.log('Update data:', updateData); // Debug

      // Call API to update profile
      const response = await authApi.updateProfile(updateData);
      console.log('Update response:', response); // Debug

      // Update Redux state với data từ server
      dispatch(updateUser(response.data.user));

      showSuccess('Cập nhật thông tin thành công');
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
            showError(`${err.field || err.param || 'Error'}: ${err.message || err.msg}`);
          });
        } else if (data.message) {
          showError(data.message);
        } else {
          showError('Không thể cập nhật thông tin');
        }
      } else if (error?.message) {
        showError(error.message);
      } else {
        showError('Không thể cập nhật thông tin');
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

      showSuccess('Đổi mật khẩu thành công');
      passwordForm.resetFields();
    } catch (error) {
      showError(error || 'Không thể đổi mật khẩu');
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
      showError('Chỉ được upload file ảnh!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      showError('Ảnh phải nhỏ hơn 5MB!');
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

      showSuccess('Đổi ảnh đại diện thành công!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      showError(error?.message || 'Không thể upload ảnh');
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
    if (address) {
      addressForm.setFieldsValue(address);
    } else {
      addressForm.resetFields();
    }
    setAddressModalVisible(true);
  };

  /**
   * Handle save address
   */
  const handleSaveAddress = async (values) => {
    try {
      setSavingAddress(true);

      if (editingAddress) {
        // Update
        await addressApi.updateAddress(editingAddress._id, values);
        showSuccess('Cập nhật địa chỉ thành công');
      } else {
        // Create
        await addressApi.createAddress(values);
        showSuccess('Thêm địa chỉ thành công');
      }

      setAddressModalVisible(false);
      addressForm.resetFields();
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      showError(error?.message || 'Không thể lưu địa chỉ');
    } finally {
      setSavingAddress(false);
    }
  };

  /**
   * Handle delete address
   */
  const handleDeleteAddress = async (id) => {
    try {
      await addressApi.deleteAddress(id);
      showSuccess('Xóa địa chỉ thành công');
      fetchAddresses();
    } catch (error) {
      showError(error?.message || 'Không thể xóa địa chỉ');
    }
  };

  /**
   * Handle set default address
   */
  const handleSetDefaultAddress = async (id) => {
    try {
      await addressApi.setDefaultAddress(id);
      showSuccess('Đặt địa chỉ mặc định thành công');
      fetchAddresses();
    } catch (error) {
      showError(error?.message || 'Không thể đặt địa chỉ mặc định');
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
                  avatar={<EnvironmentOutlined style={{ fontSize: 24 }} />}
                  title={
                    <Space>
                      <span>{address.recipientName}</span>
                      <span>|</span>
                      <span>{address.phone}</span>
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

      {/* Address Modal */}
      <Modal
        title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        open={addressModalVisible}
        onCancel={() => {
          setAddressModalVisible(false);
          addressForm.resetFields();
          setEditingAddress(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleSaveAddress}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="recipientName"
                label="Họ và tên người nhận"
                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              >
                <Input size="large" placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ!',
                  },
                ]}
              >
                <Input size="large" placeholder="0123456789" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="province"
                label="Tỉnh/Thành phố"
                rules={[{ required: true, message: 'Vui lòng nhập tỉnh!' }]}
              >
                <Input size="large" placeholder="Hà Nội" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="district"
                label="Quận/Huyện"
                rules={[{ required: true, message: 'Vui lòng nhập quận!' }]}
              >
                <Input size="large" placeholder="Cầu Giấy" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="ward"
                label="Phường/Xã"
                rules={[{ required: true, message: 'Vui lòng nhập phường!' }]}
              >
                <Input size="large" placeholder="Dịch Vọng" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="detailAddress"
                label="Địa chỉ chi tiết"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input.TextArea
                  size="large"
                  rows={3}
                  placeholder="Số nhà, tên đường..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={savingAddress}
            >
              {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
            </Button>
            <Button
              onClick={() => {
                setAddressModalVisible(false);
                addressForm.resetFields();
                setEditingAddress(null);
              }}
            >
              Hủy
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;