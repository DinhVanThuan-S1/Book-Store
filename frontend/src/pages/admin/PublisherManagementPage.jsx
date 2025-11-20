/**
 * ==============================================
 * PUBLISHER MANAGEMENT PAGE
 * ==============================================
 * Quản lý nhà xuất bản
 * Author: DinhVanThuan-S1
 * Date: 2025-11-18
 */

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  Popconfirm,
  message,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { publisherApi } from '@api';
import './PublisherManagementPage.scss';

const { Title, Text } = Typography;

const PublisherManagementPage = () => {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [form] = Form.useForm();

  /**
   * Fetch publishers
   */
  const fetchPublishers = async () => {
    try {
      setLoading(true);
      const response = await publisherApi.getPublishers();
      setPublishers(response.data.publishers);
    } catch (error) {
      message.error('Không thể tải danh sách nhà xuất bản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishers();
  }, []);

  /**
   * Handle create
   */
  const handleCreate = () => {
    setEditingPublisher(null);
    form.resetFields();
    setModalVisible(true);
  };

  /**
   * Handle edit
   */
  const handleEdit = (publisher) => {
    setEditingPublisher(publisher);
    form.setFieldsValue({
      name: publisher.name,
      address: publisher.address,
      phone: publisher.phone,
      email: publisher.email,
    });
    setModalVisible(true);
  };

  /**
   * Handle submit
   */
  const handleSubmit = async (values) => {
    try {
      if (editingPublisher) {
        await publisherApi.updatePublisher(editingPublisher._id, values);
        message.success('Cập nhật nhà xuất bản thành công');
      } else {
        await publisherApi.createPublisher(values);
        message.success('Tạo nhà xuất bản thành công');
      }

      setModalVisible(false);
      fetchPublishers();
    } catch (error) {
      message.error(error || 'Không thể lưu nhà xuất bản');
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id) => {
    try {
      await publisherApi.deletePublisher(id);
      message.success('Xóa nhà xuất bản thành công');
      fetchPublishers();
    } catch (error) {
      message.error('Không thể xóa nhà xuất bản');
    }
  };

  /**
   * Columns
   */
  const columns = [
    {
      title: 'Tên nhà xuất bản',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>
            <PhoneOutlined /> {record.phone}
          </div>
          <div>
            <MailOutlined /> {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Số sách',
      dataIndex: 'bookCount',
      key: 'bookCount',
      render: (count) => <Tag color="blue">{count || 0} sách</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa nhà xuất bản?"
            description="Bạn có chắc chắn muốn xóa nhà xuất bản này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="publisher-management-page">
      <div className="page-header">
        <div>
          <Title level={2}>Quản lý nhà xuất bản</Title>
          <Text type="secondary">Tổng số: {publishers.length} nhà xuất bản</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreate}
        >
          Thêm nhà xuất bản
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={publishers}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />

      {/* Modal */}
      <Modal
        title={editingPublisher ? 'Chỉnh sửa nhà xuất bản' : 'Thêm nhà xuất bản mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên nhà xuất bản"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà xuất bản!' }]}
          >
            <Input
              prefix={<HomeOutlined />}
              placeholder="Nhập tên nhà xuất bản"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea
              rows={2}
              placeholder="Nhập địa chỉ nhà xuất bản"
            />
          </Form.Item>

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
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                {editingPublisher ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)} size="large">
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PublisherManagementPage;