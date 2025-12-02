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
  Descriptions,
} from 'antd';
import { useMessage } from '@utils/notification';
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

const { Title, Text } = Typography;
const { TextArea } = Input;

const AuthorManagementPage = () => {
  const { message } = useMessage();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      message.error('Không thể tải danh sách tác giả', error.message || error);
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

      // Lấy URL ảnh từ fileList (đã upload trước)
      const imageUrl = fileList.length > 0 && fileList[0].url
        ? fileList[0].url
        : editingAuthor?.image;

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
      width: 350,
      ellipsis: true,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'nationality',
      key: 'nationality',
      width: 200,
    },
    {
      title: 'Số sách',
      dataIndex: 'bookCount',
      key: 'bookCount',
      width: 120,
      align: 'left',
      render: (count, record) => (
        <Button
          type="link"
          onClick={() => handleViewBooks(record)}
          icon={<BookOutlined />}
          style={{ padding: 0, textAlign: 'left' }}
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
        <div>
          <Title level={2}>Quản lý tác giả</Title>
          <Text type="secondary">Tổng : {authors.length} tác giả</Text>
        </div>
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

          <Form.Item name="nationality" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ tác giả" />
          </Form.Item>

          <Form.Item label="Ảnh đại diện">
            <Upload
              fileList={fileList}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              beforeUpload={async (file) => {
                // Validate file type
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('Chỉ được upload file ảnh!');
                  return false;
                }

                // Validate file size (max 5MB)
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
                  return false;
                }

                // Upload to Cloudinary
                try {
                  setUploading(true);

                  // Create temp file object with uploading status
                  const tempFile = {
                    uid: file.uid,
                    name: file.name,
                    status: 'uploading',
                    url: '',
                  };
                  setFileList([tempFile]);

                  // Upload to Cloudinary
                  const response = await uploadApi.uploadImage(file);
                  console.log('Upload response:', response);

                  // Update file với URL từ Cloudinary
                  const uploadedFile = {
                    uid: file.uid,
                    name: file.name,
                    status: 'done',
                    url: response.url,
                    publicId: response.publicId,
                  };

                  setFileList([uploadedFile]);
                  message.success('Upload ảnh thành công!');
                } catch (error) {
                  console.error('Upload error:', error);
                  message.error(error.message || 'Upload ảnh thất bại!');
                  setFileList([]);
                } finally {
                  setUploading(false);
                }

                return false; // Prevent auto upload
              }}
              onRemove={(file) => {
                setFileList([]);
                // Xóa ảnh trên Cloudinary nếu có
                if (file.publicId) {
                  uploadApi.deleteImage(file.publicId).catch(err => {
                    console.error('Delete image error:', err);
                  });
                }
              }}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              )}
            </Upload>
            {uploading && (
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                Đang upload...
              </Text>
            )}
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
        onCancel={() => {
          setBooksModalVisible(false);
          setDetailModalVisible(true);
        }}
        footer={
          <Button onClick={() => {
            setBooksModalVisible(false);
            setDetailModalVisible(true);
          }}>
            Quay lại
          </Button>
        }
        width={900}
      >
        <Table
          columns={[
            {
              title: 'Ảnh',
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
        title="Thông tin tác giả"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={
          <Button onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        }
      >
        {selectedAuthor && (
          <div>
            {/* Author Info - Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                src={selectedAuthor.image}
                icon={<UserOutlined />}
                size={80}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>
                {selectedAuthor.name}
              </Title>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">
                  <BookOutlined /> {selectedAuthor.bookCount || 0} sách
                </Tag>
              </div>
            </div>

            {/* Author Details */}
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {selectedAuthor.nationality ? (
                  selectedAuthor.nationality
                ) : (
                  <Text type="secondary" italic>Chưa cập nhật</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Tiểu sử" span={2}>
                {selectedAuthor.bio && selectedAuthor.bio.trim() !== '' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedAuthor.bio}
                  </div>
                ) : (
                  <Text type="secondary" italic>Chưa có tiểu sử</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Số lượng sách" span={2}>
                <Text strong style={{ fontSize: 16 }}>
                  {selectedAuthor.bookCount || 0} sách
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Action Buttons */}
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleEdit(selectedAuthor);
                }}
                block
              >
                Chỉnh sửa tác giả
              </Button>
              {selectedAuthor.bookCount > 0 && (
                <Button
                  type="default"
                  icon={<BookOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleViewBooks(selectedAuthor);
                  }}
                  block
                >
                  Xem danh sách sách
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuthorManagementPage;
