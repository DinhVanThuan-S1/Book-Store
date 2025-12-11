

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
  Image,
  Tag,
  Descriptions,
  Avatar,
} from 'antd';
import { useMessage } from '@utils/notification';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  BookOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { categoryApi, uploadApi } from '@api';
import './CategoryManagementPage.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CategoryManagementPage = () => {
  const { message } = useMessage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [booksModalVisible, setBooksModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);

  /**
   * Fetch categories
   */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Admin xem tất cả danh mục (kể cả bị ẩn)
      const response = await categoryApi.getCategories({ includeInactive: true });
      setCategories(response.data.categories);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Handle create
   */
  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  /**
   * Handle edit
   */
  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    // Hiển thị ảnh hiện tại nếu có
    setFileList(
      category.image && category.image !== 'https://via.placeholder.com/300'
        ? [{ uid: '-1', url: category.image, status: 'done' }]
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
        : editingCategory?.image;

      const data = {
        name: values.name,
        description: values.description || '',
      };

      // Chỉ thêm image nếu có
      if (imageUrl) {
        data.image = imageUrl;
      }

      console.log('Submitting category data:', data);

      if (editingCategory) {
        const response = await categoryApi.updateCategory(editingCategory._id, data);
        console.log('Update response:', response);
        message.success('Cập nhật danh mục thành công');
      } else {
        const response = await categoryApi.createCategory(data);
        console.log('Create response:', response);
        message.success('Tạo danh mục thành công');
      }

      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchCategories();
    } catch (error) {
      console.error('Submit error:', error);
      message.error(error.message || 'Không thể lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id) => {
    try {
      const response = await categoryApi.deleteCategory(id);
      console.log('Delete response:', response);
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error?.response?.data?.message || error.message || 'Không thể xóa danh mục';
      message.error(errorMessage);
    }
  };

  /**
   * Handle toggle status
   */
  const handleToggleStatus = async (category) => {
    try {
      await categoryApi.toggleCategoryStatus(category._id);
      message.success(
        category.isActive
          ? 'Đã ẩn danh mục khỏi trang client'
          : 'Đã hiển thị danh mục trên trang client'
      );
      fetchCategories();
    } catch (error) {
      console.error('Toggle status error:', error);
      message.error(error?.response?.data?.message || 'Không thể thay đổi trạng thái');
    }
  };

  /**
   * Handle view books
   */
  const handleViewBooks = async (category) => {
    try {
      setSelectedCategory(category);
      setBooksModalVisible(true);
      setBooksLoading(true);

      const response = await categoryApi.getCategoryBooks(category._id);
      setCategoryBooks(response.data.books);
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
  const handleViewDetail = (category) => {
    setSelectedCategory(category);
    setDetailModalVisible(true);
  };

  /**
   * Columns
   */
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) => (
        <Image
          src={image}
          alt="Category"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 8 }}
        />
      ),
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 400,
      ellipsis: true,
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
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Hiển thị' : 'Ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 280,
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
            type={record.isActive ? 'default' : 'primary'}
            size="small"
            icon={record.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => handleToggleStatus(record)}
            title={record.isActive ? 'Ẩn khỏi client' : 'Hiển thị trên client'}
          />
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục?"
            description={record.bookCount > 0 ? `Danh mục có ${record.bookCount} sách, không thể xóa!` : 'Bạn có chắc chắn muốn xóa?'}
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
    <div className="category-management-page">
      <div className="page-header">
        <div>
          <Title level={2}>Quản lý danh mục</Title>
          <Text type="secondary">Tổng : {categories.length} danh mục</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreate}
        >
          Thêm danh mục
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal */}
      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Nhập mô tả danh mục" />
          </Form.Item>

          <Form.Item label="Hình ảnh">
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
                {editingCategory ? 'Cập nhật' : 'Tạo mới'}
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
        title={`Danh sách sách - ${selectedCategory?.name}`}
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
              title: 'Tác giả',
              dataIndex: ['author', 'name'],
              key: 'author',
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
          dataSource={categoryBooks}
          rowKey="_id"
          loading={booksLoading}
          pagination={{ pageSize: 10 }}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Thông tin danh mục"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={
          <Button onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        }
      >
        {selectedCategory && (
          <div>
            {/* Category Info - Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Image
                src={selectedCategory.image}
                alt={selectedCategory.name}
                width={120}
                height={120}
                style={{ borderRadius: 8, objectFit: 'cover' }}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>
                {selectedCategory.name}
              </Title>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">
                  <BookOutlined /> {selectedCategory.bookCount || 0} sách
                </Tag>
              </div>
            </div>

            {/* Category Details */}
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedCategory.description && selectedCategory.description.trim() !== '' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedCategory.description}
                  </div>
                ) : (
                  <Text type="secondary" italic>Chưa có mô tả</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Số lượng sách" span={2}>
                <Text strong style={{ fontSize: 16 }}>
                  {selectedCategory.bookCount || 0} sách
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
                  handleEdit(selectedCategory);
                }}
                block
              >
                Chỉnh sửa danh mục
              </Button>
              {selectedCategory.bookCount > 0 && (
                <Button
                  type="default"
                  icon={<BookOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleViewBooks(selectedCategory);
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

export default CategoryManagementPage;
