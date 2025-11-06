/**
 * ==============================================
 * BOOK MANAGEMENT PAGE (Admin)
 * ==============================================
 * Quản lý sách cho admin
 */

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Image,
  Modal,
  Form,
  InputNumber,
  Typography,
  Popconfirm,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { bookApi, categoryApi } from '@api';
import { formatPrice } from '@utils/formatPrice';
import { showSuccess, showError } from '@utils/notification';
import Loading from '@components/common/Loading';
import './BookManagementPage.scss';

const { Title } = Typography;
const { Search } = Input;

const BookManagementPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    category: null,
  });

  // Modal states
  const [addCopiesModalVisible, setAddCopiesModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [addingCopies, setAddingCopies] = useState(false);

  const [form] = Form.useForm();

  /**
   * Fetch books
   */
  const fetchBooks = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await bookApi.getBooks(params);

      setBooks(response.data.books);
      setPagination({
        ...pagination,
        current: response.data.pagination.page,
        total: response.data.pagination.total,
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      showError('Không thể tải danh sách sách');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch categories
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  /**
   * Handle search
   */
  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
  };

  /**
   * Handle category filter
   */
  const handleCategoryChange = (value) => {
    setFilters({ ...filters, category: value });
  };

  /**
   * Handle table change
   */
  const handleTableChange = (newPagination) => {
    fetchBooks(newPagination.current);
  };

  /**
   * Handle add copies
   */
  const handleAddCopies = (book) => {
    setSelectedBook(book);
    setAddCopiesModalVisible(true);
  };

  /**
   * Submit add copies
   */
  const handleAddCopiesSubmit = async (values) => {
    try {
      setAddingCopies(true);

      await bookApi.addBookCopies(selectedBook._id, values);

      showSuccess('Đã thêm bản sao thành công');
      setAddCopiesModalVisible(false);
      form.resetFields();
      fetchBooks(pagination.current);
    } catch (error) {
      showError(error || 'Không thể thêm bản sao');
    } finally {
      setAddingCopies(false);
    }
  };

  /**
   * Handle delete book
   */
  const handleDeleteBook = async (bookId) => {
    try {
      await bookApi.deleteBook(bookId);
      showSuccess('Đã xóa sách thành công');
      fetchBooks(pagination.current);
    } catch (error) {
      showError(error || 'Không thể xóa sách');
    }
  };

  /**
   * Table columns
   */
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images, record) => (
        <Image
          src={images?.[0]}
          alt={record.title}
          width={60}
          height={84}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="https://via.placeholder.com/60x84?text=No+Image"
        />
      ),
    },
    {
      title: 'Tên sách',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.author?.name}
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">{category?.name}</Tag>
      ),
    },
    {
      title: 'Giá gốc',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      render: (price) => formatPrice(price),
    },
    {
      title: 'Giá bán',
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (price) => (
        <span style={{ color: '#f5222d', fontWeight: 600 }}>
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'availableCopies',
      key: 'availableCopies',
      render: (count) => (
        <Tag color={count > 0 ? 'green' : 'red'}>
          {count} quyển
        </Tag>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'purchaseCount',
      key: 'purchaseCount',
      render: (count) => count || 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Đang bán' : 'Ngừng bán'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusCircleOutlined />}
            onClick={() => handleAddCopies(record)}
          >
            Thêm sách
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sách này?"
            description="Bạn có chắc chắn muốn xóa sách này?"
            onConfirm={() => handleDeleteBook(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="book-management-page">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2}>Quản lý sách</Title>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <Space size="middle">
          <Search
            placeholder="Tìm kiếm sách..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />

          <Select
            placeholder="Chọn danh mục"
            allowClear
            onChange={handleCategoryChange}
            style={{ width: 200 }}
            options={[
              { value: null, label: 'Tất cả danh mục' },
              ...categories.map((cat) => ({
                value: cat._id,
                label: cat.name,
              })),
            ]}
          />
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
        >
          Thêm sách mới
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={books}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      {/* Add Copies Modal */}
      <Modal
        title={`Thêm bản sao - ${selectedBook?.title}`}
        open={addCopiesModalVisible}
        onCancel={() => {
          setAddCopiesModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCopiesSubmit}
        >
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
            ]}
          >
            <InputNumber
              min={1}
              max={1000}
              style={{ width: '100%' }}
              placeholder="Nhập số lượng bản sao"
            />
          </Form.Item>

          <Form.Item
            name="importPrice"
            label="Giá nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập giá nhập!' },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Nhập giá nhập"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="condition"
            label="Tình trạng"
            initialValue="new"
          >
            <Select>
              <Select.Option value="new">Mới</Select.Option>
              <Select.Option value="like_new">Như mới</Select.Option>
              <Select.Option value="good">Tốt</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="warehouseLocation"
            label="Vị trí kho"
          >
            <Input placeholder="VD: Kệ A1" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={addingCopies}
              >
                Thêm bản sao
              </Button>
              <Button
                onClick={() => {
                  setAddCopiesModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookManagementPage;