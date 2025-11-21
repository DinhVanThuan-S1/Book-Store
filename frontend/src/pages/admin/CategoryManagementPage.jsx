/**
 * ==============================================
 * CATEGORY MANAGEMENT PAGE
 * ==============================================
 * Quản lý danh mục sách
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
  Image,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  BookOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { categoryApi, uploadApi } from '@api';
import './CategoryManagementPage.scss';

const { Title } = Typography;
const { TextArea } = Input;

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
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
      const response = await categoryApi.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục');
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
      let imageUrl = editingCategory?.image;

      // Upload ảnh nếu có file mới
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          const uploadResponse = await uploadApi.uploadImage(fileList[0].originFileObj);
          console.log('Upload response:', uploadResponse);
          // uploadResponse đã là { url, publicId } do uploadApi.uploadImage return response.data
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
      await categoryApi.deleteCategory(id);
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      console.error('Delete error:', error);
      message.error(error.message || 'Không thể xóa danh mục');
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
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
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
        <Title level={2}>Quản lý danh mục</Title>
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
        title="Thông tin chi tiết danh mục"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedCategory && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <Image
                src={selectedCategory.image}
                alt={selectedCategory.name}
                width={200}
                style={{ borderRadius: 8, marginBottom: 16 }}
              />
              <div>
                <Title level={3} style={{ marginBottom: 8 }}>
                  {selectedCategory.name}
                </Title>
                <Tag color="blue">
                  <BookOutlined /> {selectedCategory.bookCount || 0} sách
                </Tag>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <strong>Mô tả:</strong>
              <div style={{ marginLeft: 24, marginTop: 8, color: '#666' }}>
                {selectedCategory.description || 'Chưa có mô tả'}
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleEdit(selectedCategory);
                  }}
                >
                  Chỉnh sửa
                </Button>
                {selectedCategory.bookCount > 0 && (
                  <Button
                    icon={<BookOutlined />}
                    onClick={() => {
                      setDetailModalVisible(false);
                      handleViewBooks(selectedCategory);
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

export default CategoryManagementPage;