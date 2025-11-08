/**
 * ==============================================
 * BOOK MANAGEMENT PAGE - COMPLETE VERSION
 * ==============================================
 * Quản lý sách cho admin với đầy đủ tính năng:
 * - CRUD sách
 * - Thêm bản sao (BookCopy)
 * - Filter & Search
 * - Pagination
 * 
 * Author: DinhVanThuan-S1
 * Date: 2025-11-06
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
  Upload,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { bookApi, categoryApi, authorApi, publisherApi } from '@api';
import { formatPrice } from '@utils/formatPrice';
import { showSuccess, showError } from '@utils/notification';
import {
  BOOK_FORMAT_LABELS,
  BOOK_FORMATS,
  LANGUAGE_LABELS,
  LANGUAGES,
} from '@constants/appConstants';
import Loading from '@components/common/Loading';
import './BookManagementPage.scss';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const BookManagementPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
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
  const [bookFormModalVisible, setBookFormModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [addingCopies, setAddingCopies] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [fileList, setFileList] = useState([]);

  const [copiesForm] = Form.useForm();
  const [bookForm] = Form.useForm();

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

  /**
   * Fetch authors (nếu có API)
   */
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        // Assuming you have authorApi.getAuthors()
        // const response = await authorApi.getAuthors();
        // setAuthors(response.data.authors);

        // Mock data for now
        setAuthors([
          { _id: '1', name: 'Nguyễn Nhật Ánh' },
          { _id: '2', name: 'Aoyama Gosho' },
          { _id: '3', name: 'Dale Carnegie' },
          { _id: '4', name: 'Tony Buổi Sáng' },
        ]);
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    fetchAuthors();
  }, []);

  /**
   * Fetch publishers (nếu có API)
   */
  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        // Assuming you have publisherApi.getPublishers()
        // const response = await publisherApi.getPublishers();
        // setPublishers(response.data.publishers);

        // Mock data for now
        setPublishers([
          { _id: '1', name: 'NXB Kim Đồng' },
          { _id: '2', name: 'NXB Trẻ' },
          { _id: '3', name: 'NXB Văn học' },
          { _id: '4', name: 'NXB Lao động' },
        ]);
      } catch (error) {
        console.error('Error fetching publishers:', error);
      }
    };

    fetchPublishers();
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
   * Handle create book
   */
  const handleCreateBook = () => {
    setEditingBook(null);
    setFileList([]);
    bookForm.resetFields();
    setBookFormModalVisible(true);
  };

  /**
   * Handle edit book
   */
  const handleEditBook = (book) => {
    setEditingBook(book);

    // Set form values
    bookForm.setFieldsValue({
      title: book.title,
      author: book.author?._id,
      publisher: book.publisher?._id,
      category: book.category?._id,
      isbn: book.isbn,
      publishYear: book.publishYear,
      pages: book.pages,
      language: book.language,
      format: book.format,
      description: book.description,
      originalPrice: book.originalPrice,
      salePrice: book.salePrice,
    });

    // Set images
    const imageFileList = book.images?.map((url, index) => ({
      uid: index,
      name: `image-${index}`,
      status: 'done',
      url: url,
    }));
    setFileList(imageFileList || []);

    setBookFormModalVisible(true);
  };

  /**
   * Handle save book (create or update)
   */
  const handleSaveBook = async (values) => {
    try {
      setSavingBook(true);

      // Prepare book data
      const bookData = {
        ...values,
        images: fileList
          .filter((file) => file.status === 'done')
          .map((file) => file.url || file.response?.url || ''),
      };

      if (editingBook) {
        // Update existing book
        await bookApi.updateBook(editingBook._id, bookData);
        showSuccess('Cập nhật sách thành công');
      } else {
        // Create new book
        await bookApi.createBook(bookData);
        showSuccess('Tạo sách mới thành công');
      }

      // Reset and close
      bookForm.resetFields();
      setFileList([]);
      setBookFormModalVisible(false);
      setEditingBook(null);

      // Refresh list
      fetchBooks(pagination.current);
    } catch (error) {
      showError(error || 'Không thể lưu sách');
    } finally {
      setSavingBook(false);
    }
  };

  /**
   * Handle add copies
   */
  const handleAddCopies = (book) => {
    setSelectedBook(book);
    copiesForm.resetFields();
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
      copiesForm.resetFields();
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
   * Handle upload change
   */
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  /**
   * Upload button
   */
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

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
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.author?.name}
          </div>
          {record.isbn && (
            <div style={{ fontSize: 11, color: '#bbb' }}>
              ISBN: {record.isbn}
            </div>
          )}
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
      title: 'NXB',
      dataIndex: 'publisher',
      key: 'publisher',
      render: (publisher) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {publisher?.name || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Giá gốc',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      render: (price) => (
        <Text style={{ fontSize: 13 }}>{formatPrice(price)}</Text>
      ),
    },
    {
      title: 'Giá bán',
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (price, record) => (
        <div>
          <div style={{ color: '#f5222d', fontWeight: 600 }}>
            {formatPrice(price)}
          </div>
          {record.discountPercent > 0 && (
            <Tag color="red" style={{ fontSize: 11, marginTop: 4 }}>
              -{record.discountPercent}%
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'availableCopies',
      key: 'availableCopies',
      render: (count) => (
        <Tag color={count > 10 ? 'green' : count > 0 ? 'orange' : 'red'}>
          {count} quyển
        </Tag>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'purchaseCount',
      key: 'purchaseCount',
      render: (count) => (
        <Text strong style={{ color: '#1890ff' }}>
          {count || 0}
        </Text>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'averageRating',
      key: 'averageRating',
      render: (rating, record) => (
        <div style={{ fontSize: 12 }}>
          <div>⭐ {rating?.toFixed(1) || 0}</div>
          <div style={{ color: '#999' }}>({record.reviewCount || 0})</div>
        </div>
      ),
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
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<PlusCircleOutlined />}
            onClick={() => handleAddCopies(record)}
          >
            Nhập
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditBook(record)}
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
            <Button danger size="small" icon={<DeleteOutlined />} />
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
        <Text type="secondary">
          Tổng số: {pagination.total} sách
        </Text>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <Space size="middle" wrap>
          <Search
            placeholder="Tìm kiếm sách (tên, tác giả, ISBN)..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 350 }}
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
          onClick={handleCreateBook}
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
        scroll={{ x: 1500 }}
        size="middle"
      />

      {/* ==================== ADD COPIES MODAL ==================== */}
      <Modal
        title={
          <Space>
            <PlusCircleOutlined />
            <span>Nhập thêm bản sao - {selectedBook?.title}</span>
          </Space>
        }
        open={addCopiesModalVisible}
        onCancel={() => {
          setAddCopiesModalVisible(false);
          copiesForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={copiesForm}
          layout="vertical"
          onFinish={handleAddCopiesSubmit}
          initialValues={{
            condition: 'new',
          }}
        >
          <Form.Item
            name="quantity"
            label="Số lượng nhập"
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
            label="Giá nhập (mỗi quyển)"
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
              addonAfter="₫"
            />
          </Form.Item>

          <Form.Item
            name="condition"
            label="Tình trạng sách"
          >
            <Select>
              <Select.Option value="new">Mới</Select.Option>
              <Select.Option value="like_new">Như mới</Select.Option>
              <Select.Option value="good">Tốt</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="warehouseLocation"
            label="Vị trí kho (không bắt buộc)"
          >
            <Input placeholder="VD: Kệ A1, Tầng 2" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={addingCopies}
                icon={<PlusCircleOutlined />}
              >
                Thêm bản sao
              </Button>
              <Button
                onClick={() => {
                  setAddCopiesModalVisible(false);
                  copiesForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ==================== BOOK FORM MODAL (CREATE/EDIT) ==================== */}
      <Modal
        title={
          <Space>
            {editingBook ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}</span>
          </Space>
        }
        open={bookFormModalVisible}
        onCancel={() => {
          setBookFormModalVisible(false);
          bookForm.resetFields();
          setFileList([]);
          setEditingBook(null);
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Form
          form={bookForm}
          layout="vertical"
          onFinish={handleSaveBook}
        >
          <Row gutter={16}>
            {/* Left Column */}
            <Col span={12}>
              <Form.Item
                name="title"
                label="Tên sách"
                rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
              >
                <Input placeholder="Nhập tên sách" size="large" />
              </Form.Item>

              <Form.Item
                name="author"
                label="Tác giả"
                rules={[{ required: true, message: 'Vui lòng chọn tác giả!' }]}
              >
                <Select
                  placeholder="Chọn tác giả"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={authors.map((author) => ({
                    value: author._id,
                    label: author.name,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="publisher"
                label="Nhà xuất bản"
                rules={[{ required: true, message: 'Vui lòng chọn NXB!' }]}
              >
                <Select
                  placeholder="Chọn nhà xuất bản"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={publishers.map((pub) => ({
                    value: pub._id,
                    label: pub.name,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  options={categories.map((cat) => ({
                    value: cat._id,
                    label: cat.name,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="isbn"
                label="ISBN"
              >
                <Input placeholder="Nhập mã ISBN (không bắt buộc)" />
              </Form.Item>
            </Col>

            {/* Right Column */}
            <Col span={12}>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="publishYear"
                    label="Năm xuất bản"
                  >
                    <InputNumber
                      min={1900}
                      max={new Date().getFullYear() + 1}
                      style={{ width: '100%' }}
                      placeholder="2024"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="pages"
                    label="Số trang"
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="300"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="language"
                label="Ngôn ngữ"
              >
                <Select placeholder="Chọn ngôn ngữ">
                  {Object.keys(LANGUAGES).map((key) => (
                    <Select.Option key={LANGUAGES[key]} value={LANGUAGES[key]}>
                      {LANGUAGE_LABELS[LANGUAGES[key]]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="format"
                label="Hình thức"
              >
                <Select placeholder="Chọn hình thức">
                  {Object.keys(BOOK_FORMATS).map((key) => (
                    <Select.Option key={BOOK_FORMATS[key]} value={BOOK_FORMATS[key]}>
                      {BOOK_FORMAT_LABELS[BOOK_FORMATS[key]]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="originalPrice"
                    label="Giá gốc"
                    rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="₫"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="salePrice"
                    label="Giá bán"
                    rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="₫"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả sách"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả ngắn gọn về sách..."
            />
          </Form.Item>

          <Form.Item label="Hình ảnh sách">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false} // Prevent auto upload
              maxCount={5}
            >
              {fileList.length >= 5 ? null : uploadButton}
            </Upload>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tối đa 5 ảnh. Ảnh đầu tiên sẽ là ảnh chính.
            </Text>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={savingBook}
                icon={editingBook ? <EditOutlined /> : <PlusOutlined />}
                size="large"
              >
                {editingBook ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button
                size="large"
                onClick={() => {
                  setBookFormModalVisible(false);
                  bookForm.resetFields();
                  setFileList([]);
                  setEditingBook(null);
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