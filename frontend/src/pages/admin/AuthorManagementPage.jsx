/**
 * ==============================================
 * AUTHOR MANAGEMENT PAGE
 * ==============================================
 * Quản lý tác giả
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
  Upload,
  Typography,
  Popconfirm,
  message,
  Avatar,
  Image,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  UploadOutlined,
  BookOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { authorApi, uploadApi } from '@api';
import './AuthorManagementPage.scss';

const { Title } = Typography;
const { TextArea } = Input;

const AuthorManagementPage = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [booksModalVisible, setBooksModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);

  /**
   * Fetch authors
   */
  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await authorApi.getAuthors();
      setAuthors(response.data.authors);
    } catch (error) {
      message.error('Không thể tải danh sách tác giả');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  /**
   * Handle create
   */
  const handleCreate = () => {
    setEditingAuthor(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  /**
   * Handle edit
   */
  const handleEdit = (author) => {
    setEditingAuthor(author);
    form.setFieldsValue({
      name: author.name,
      bio: author.bio,
      nationality: author.nationality,
    });
    setFileList(
      author.image && author.image !== 'https://via.placeholder.com/150'
        ? [{ uid: '-1', url: author.image, status: 'done' }]
        : []
    );
    setModalVisible(true);
  };

  /**
   * Handle submit
   */
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      let imageUrl = editingAuthor?.image;

      // Upload ảnh nếu có file mới
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          const uploadResponse = await uploadApi.uploadImage(fileList[0].originFileObj);
          console.log('Upload response:', uploadResponse);
          imageUrl = uploadResponse.url;
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          message.error(uploadError.message || 'Không thể tải ảnh lên');
          setSubmitting(false);
          return;
        }
      }

      const data = {
        name: values.name,
        bio: values.bio || '',
        nationality: values.nationality || '',
      };

      // Chỉ thêm image nếu có
      if (imageUrl) {
        data.image = imageUrl;
      }

      console.log('Submitting author data:', data);

      if (editingAuthor) {
        const response = await authorApi.updateAuthor(editingAuthor._id, data);
        console.log('Update response:', response);
        message.success('Cập nhật tác giả thành công');
      } else {
        const response = await authorApi.createAuthor(data);
        console.log('Create response:', response);
        message.success('Tạo tác giả thành công');
      }

      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchAuthors();
    } catch (error) {
      console.error('Submit error:', error);
      message.error(error.message || 'Không thể lưu tác giả');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id) => {
    try {
      await authorApi.deleteAuthor(id);
      message.success('Xóa tác giả thành công');
      fetchAuthors();
    } catch (error) {
      console.error('Delete error:', error);
      message.error(error.message || 'Không thể xóa tác giả');
    }
  };

  /**
   * Handle view books
   */
  const handleViewBooks = async (author) => {
    try {
      setSelectedAuthor(author);
      setBooksModalVisible(true);
      setBooksLoading(true);

      const response = await authorApi.getAuthorBooks(author._id);
      setAuthorBooks(response.data.books);
    } catch (error) {
      console.error('Fetch books error:', error);
      message.error('Không thể tải danh sách sách');
    } finally {
      setBooksLoading(false);
    }
  };

  /**
   * Handle view detail
   */
  const handleViewDetail = (author) => {
    setSelectedAuthor(author);
    setDetailModalVisible(true);
  };

  /**
   * Columns
   */
  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image, record) => (
        <Avatar src={image} icon={<UserOutlined />} size={50} />
      ),
    },
    {
      title: 'Tên tác giả',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Tiểu sử',
      dataIndex: 'bio',
      key: 'bio',
      ellipsis: true,
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'nationality',
      key: 'nationality',
    },
    {
      title: 'Số sách',
      dataIndex: 'bookCount',
      key: 'bookCount',
      width: 120,
      render: (count, record) => (
        <Button
          type="link"
          onClick={() => handleViewBooks(record)}
          icon={<BookOutlined />}
        >
          {count || 0} sách
        </Button>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="Xem chi tiết"
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
            title="Xóa tác giả?"
            description={record.bookCount > 0 ? `Tác giả có ${record.bookCount} sách, không thể xóa!` : 'Bạn có chắc chắn muốn xóa?'}
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
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="author-management-page">
      <div className="page-header">
        <Title level={2}>Quản lý tác giả</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreate}
        >
          Thêm tác giả
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={authors}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal */}
      <Modal
        title={editingAuthor ? 'Chỉnh sửa tác giả' : 'Thêm tác giả mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên tác giả"
            rules={[{ required: true, message: 'Vui lòng nhập tên tác giả!' }]}
          >
            <Input placeholder="Nhập tên tác giả" />
          </Form.Item>

          <Form.Item name="bio" label="Tiểu sử">
            <TextArea rows={4} placeholder="Nhập tiểu sử tác giả" />
          </Form.Item>

          <Form.Item name="nationality" label="Quốc tịch">
            <Input placeholder="Nhập quốc tịch tác giả" />
          </Form.Item>

          <Form.Item label="Ảnh đại diện">
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              listType="picture-card"
              accept="image/*"
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingAuthor ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)} disabled={submitting}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem danh sách sách */}
      <Modal
        title={`Danh sách sách - ${selectedAuthor?.name}`}
        open={booksModalVisible}
        onCancel={() => setBooksModalVisible(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={[
            {
              title: 'Hình ảnh',
              dataIndex: 'images',
              key: 'images',
              width: 80,
              render: (images) => (
                <Image
                  src={images && images[0]}
                  alt="Book"
                  width={50}
                  height={70}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
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
              title: 'Danh mục',
              dataIndex: ['category', 'name'],
              key: 'category',
            },
            {
              title: 'NXB',
              dataIndex: ['publisher', 'name'],
              key: 'publisher',
            },
            {
              title: 'Giá bán',
              dataIndex: 'salePrice',
              key: 'salePrice',
              render: (price) => `${price?.toLocaleString('vi-VN')}đ`,
            },
            {
              title: 'Tồn kho',
              dataIndex: 'availableCopies',
              key: 'availableCopies',
            },
          ]}
          dataSource={authorBooks}
          rowKey="_id"
          loading={booksLoading}
          pagination={{ pageSize: 10 }}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Thông tin chi tiết tác giả"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedAuthor && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <Avatar
                src={selectedAuthor.image}
                size={120}
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <div>
                <Title level={3} style={{ marginBottom: 8 }}>
                  {selectedAuthor.name}
                </Title>
                <Tag color="blue">
                  <BookOutlined /> {selectedAuthor.bookCount || 0} sách
                </Tag>
              </div>
            </div>

            {selectedAuthor.nationality && (
              <div style={{ marginBottom: 16 }}>
                <strong>Quốc tịch:</strong>
                <div style={{ marginLeft: 24, marginTop: 8, color: '#666' }}>
                  {selectedAuthor.nationality}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <strong>Tiểu sử:</strong>
              <div style={{ marginLeft: 24, marginTop: 8, color: '#666', whiteSpace: 'pre-wrap' }}>
                {selectedAuthor.bio || 'Chưa có tiểu sử'}
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleEdit(selectedAuthor);
                  }}
                >
                  Chỉnh sửa
                </Button>
                {selectedAuthor.bookCount > 0 && (
                  <Button
                    icon={<BookOutlined />}
                    onClick={() => {
                      setDetailModalVisible(false);
                      handleViewBooks(selectedAuthor);
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

export default AuthorManagementPage;