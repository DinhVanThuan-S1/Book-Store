/**
 * ==============================================
 * ADDRESS FORM COMPONENT
 * ==============================================
 * Form thêm/sửa địa chỉ
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Row, Col, Checkbox, Radio, Space } from 'antd';
import { HomeOutlined, ShopOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { addressApi } from '@api';
import { useMessage } from '@utils/notification';

const AddressForm = ({ visible, onCancel, onSuccess, address }) => {
  const { message } = useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /**
   * Update form values when address changes or modal opens
   */
  useEffect(() => {
    if (visible) {
      if (address) {
        // Sửa địa chỉ - set các giá trị từ address
        form.setFieldsValue({
          recipientName: address.recipientName,
          phone: address.phone,
          addressType: address.addressType || 'home',
          province: address.province,
          district: address.district,
          ward: address.ward,
          detailAddress: address.detailAddress,
          isDefault: address.isDefault || false,
        });
      } else {
        // Thêm mới - reset form với giá trị mặc định
        form.resetFields();
        form.setFieldsValue({
          isDefault: false,
          addressType: 'home',
        });
      }
    }
  }, [visible, address, form]);

  /**
   * Handle submit
   */
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (address) {
        // Update existing address
        const response = await addressApi.updateAddress(address._id, values);
        onSuccess(response.data.address);
      } else {
        // Create new address
        const response = await addressApi.createAddress(values);
        onSuccess(response.data.address);
      }

      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(error.message || 'Không thể lưu địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={address ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="recipientName"
              label="Họ và tên người nhận"
              rules={[
                { required: true, message: 'Vui lòng nhập tên người nhận!' },
              ]}
            >
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
          </Col>

          <Col span={12}>
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
              <Input placeholder="0912345678" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="addressType"
          label="Loại địa chỉ"
          rules={[{ required: true, message: 'Vui lòng chọn loại địa chỉ!' }]}
        >
          <Radio.Group>
            <Space direction="horizontal" size="middle">
              <Radio value="home">
                <Space>
                  <HomeOutlined />
                  Nhà ở
                </Space>
              </Radio>
              <Radio value="office">
                <Space>
                  <ShopOutlined />
                  Văn phòng
                </Space>
              </Radio>
              <Radio value="other">
                <Space>
                  <EnvironmentOutlined />
                  Khác
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="province"
              label="Tỉnh / Thành phố"
              rules={[
                { required: true, message: 'Vui lòng nhập tỉnh/thành phố!' },
              ]}
            >
              <Input placeholder="TP. Hồ Chí Minh" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="district"
              label="Quận / Huyện"
              rules={[
                { required: true, message: 'Vui lòng nhập quận/huyện!' },
              ]}
            >
              <Input placeholder="Quận 1" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="ward"
              label="Phường / Xã"
              rules={[{ required: true, message: 'Vui lòng nhập phường/xã!' }]}
            >
              <Input placeholder="Phường Bến Nghé" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="detailAddress"
          label="Địa chỉ chi tiết"
          rules={[
            { required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' },
          ]}
        >
          <Input placeholder="Số nhà, tên đường..." />
        </Form.Item>

        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddressForm;

