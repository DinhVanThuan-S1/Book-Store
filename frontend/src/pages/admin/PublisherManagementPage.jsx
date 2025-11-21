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
  BookOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { publisherApi } from '@api';
import './PublisherManagementPage.scss';

const { Title, Text } = Typography;

const PublisherManagementPage = () => {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [booksModalVisible, setBooksModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState(null);
  const [publisherBooks, setPublisherBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
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
      website: publisher.website,
    });
    setModalVisible(true);
  };

  /**
   * Handle submit
   */
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
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
      message.error(error.message || 'Không thể lưu nhà xuất bản');
    } finally {
      setLoading(false);
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
      message.error(error.message || 'Không thể xóa nhà xuất bản');
    }
  };

  /**
   * View publisher books
   */
  const handleViewBooks = async (publisher) => {
    try {
      setSelectedPublisher(publisher);
      setBooksModalVisible(true);
      setLoadingBooks(true);

      const response = await publisherApi.getPublisherBooks(publisher._id);
      setPublisherBooks(response.data.books || []);
    } catch (error) {
      message.error('Không thể tải danh sách sách');
    } finally {
      setLoadingBooks(false);
    }
  };

  /**
   * View publisher details
   */
  const handleViewDetail = (publisher) => {
    setSelectedPublisher(publisher);
    setDetailModalVisible(true);
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
      width: 250,
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
      title: 'Liên kết',
      dataIndex: 'website',
      key: 'website',
      width: 200,
      ellipsis: true,
      render: (website) => website ? (
        <a href={website} target="_blank" rel="noopener noreferrer">
          {website}
        </a>
      ) : '-',
    },
    {
      title: 'Số sách',
      dataIndex: 'bookCount',
      key: 'bookCount',
      render: (count, record) => (
        <Tag
          color="blue"
          style={{ cursor: 'pointer' }}
          onClick={() => handleViewBooks(record)}
        >
          <BookOutlined /> {count || 0} sách
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
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
            disabled={record.bookCount > 0}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={record.bookCount > 0}
              title={record.bookCount > 0 ? 'Không thể xóa nhà xuất bản có sách' : ''}
            />
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

          <Form.Item
            name="website"
            label="Website"
            rules={[
              { type: 'url', message: 'Website không hợp lệ!' },
            ]}
          >
            <Input
              prefix={<HomeOutlined />}
              placeholder="Nhập website (ví dụ: https://example.com)"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large" loading={loading}>
                {editingPublisher ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)} size="large">
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Books Modal */}
      <Modal
        title={`Danh sách sách - ${selectedPublisher?.name}`}
        open={booksModalVisible}
        onCancel={() => setBooksModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Table
          dataSource={publisherBooks}
          rowKey="_id"
          loading={loadingBooks}
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: 'Hình ảnh',
              dataIndex: 'images',
              key: 'images',
              width: 80,
              render: (images) => (
                <img
                  src={images?.[0] || 'https://via.placeholder.com/50x70'}
                  alt="Book"
                  style={{ width: 50, height: 70, objectFit: 'cover' }}
                />
              ),
            },
            {
              title: 'Tên sách',
              dataIndex: 'title',
              key: 'title',
              render: (title) => <strong>{title}</strong>,
            },
            {
              title: 'Tác giả',
              dataIndex: ['author', 'name'],
              key: 'author',
            },
            {
              title: 'Danh mục',
              dataIndex: ['category', 'name'],
              key: 'category',
            },
            {
              title: 'Giá',
              dataIndex: 'salePrice',
              key: 'salePrice',
              render: (price) => `${price?.toLocaleString()}đ`,
            },
            {
              title: 'Tồn kho',
              dataIndex: 'availableCopies',
              key: 'availableCopies',
              render: (stock) => (
                <Tag color={stock > 0 ? 'success' : 'error'}>
                  {stock}
                </Tag>
              ),
            },
          ]}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Thông tin chi tiết nhà xuất bản"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedPublisher && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>
                {selectedPublisher.name}
              </Text>
              <Tag color="blue">
                <BookOutlined /> {selectedPublisher.bookCount || 0} sách
              </Tag>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>
                <HomeOutlined /> Địa chỉ:
              </Text>
              <div style={{ marginLeft: 24, marginTop: 4 }}>
                {selectedPublisher.address || 'Chưa cập nhật'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>
                <PhoneOutlined /> Số điện thoại:
              </Text>
              <div style={{ marginLeft: 24, marginTop: 4 }}>
                {selectedPublisher.phone || 'Chưa cập nhật'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>
                <MailOutlined /> Email:
              </Text>
              <div style={{ marginLeft: 24, marginTop: 4 }}>
                {selectedPublisher.email || 'Chưa cập nhật'}
              </div>
            </div>

            {selectedPublisher.website && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Website:</Text>
                <div style={{ marginLeft: 24, marginTop: 4 }}>
                  <a
                    href={selectedPublisher.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedPublisher.website}
                  </a>
                </div>
              </div>
            )}

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleEdit(selectedPublisher);
                  }}
                >
                  Chỉnh sửa
                </Button>
                {selectedPublisher.bookCount > 0 && (
                  <Button
                    icon={<BookOutlined />}
                    onClick={() => {
                      setDetailModalVisible(false);
                      handleViewBooks(selectedPublisher);
                    }}
                  >
                    Xem danh sách sách
                  </Button>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PublisherManagementPage;