/**
 * ==============================================
 * COMBO MANAGEMENT PAGE
 * ==============================================
 * Quản lý combo/bộ sách
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
  InputNumber,
  Select,
  Upload,
  Typography,
  Popconfirm,
  message,
  Image,
  Tag,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  MinusCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { comboApi, bookApi, uploadApi } from '@api';
import { formatPrice } from '@utils/formatPrice';
import './ComboManagementPage.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ComboManagementPage = () => {
  const [combos, setCombos] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [editingCombo, setEditingCombo] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]);

  /**
   * Fetch combos
   */
  const fetchCombos = async () => {
    try {
      setLoading(true);
      const response = await comboApi.getCombos({ includeInactive: true });
      setCombos(response.data.combos);
    } catch (error) {
      message.error('Không thể tải danh sách combo');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch books
   */
  const fetchBooks = async () => {
    try {
      const response = await bookApi.getBooks({ limit: 100 });
      setBooks(response.data.books);
    } catch (error) {
      message.error('Không thể tải danh sách sách');
    }
  };

  useEffect(() => {
    fetchCombos();
    fetchBooks();
  }, []);

  /**
   * Handle create
   */
  const handleCreate = () => {
    setEditingCombo(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  /**
   * Handle edit
   */
  const handleEdit = (combo) => {
    setEditingCombo(combo);
    form.setFieldsValue({
      name: combo.name,
      description: combo.description,
      comboPrice: combo.comboPrice,
      books: combo.books.map(b => ({ book: b.book._id, quantity: b.quantity })),
    });
    setFileList(combo.image ? [{ url: combo.image }] : []);
    setModalVisible(true);
  };

  /**
   * Handle submit
   */
  const handleSubmit = async (values) => {
    try {
      // Lấy URL ảnh từ fileList (đã upload trước)
      const imageUrl = fileList.length > 0 && fileList[0].url
        ? fileList[0].url
        : editingCombo?.image;

      const data = {
        ...values,
        image: imageUrl,
      };

      console.log('Data gửi lên server:', data);

      if (editingCombo) {
        await comboApi.updateCombo(editingCombo._id, data);
        message.success('Cập nhật combo thành công');
      } else {
        await comboApi.createCombo(data);
        message.success('Tạo combo thành công');
      }

      setModalVisible(false);
      fetchCombos();
    } catch (error) {
      console.error('Lỗi khi lưu combo:', error);
      message.error(error?.response?.data?.message || 'Không thể lưu combo');
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id) => {
    try {
      await comboApi.deleteCombo(id);
      message.success('Xóa combo thành công');
      fetchCombos();
    } catch (error) {
      message.error('Không thể xóa combo');
    }
  };

  /**
   * Handle toggle status
   */
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await comboApi.toggleComboStatus(id);
      message.success(
        currentStatus
          ? 'Đã ẩn combo khỏi client'
          : 'Đã hiển thị combo trên client'
      );
      fetchCombos();
    } catch (error) {
      message.error('Không thể thay đổi trạng thái combo');
    }
  };

  /**
   * Handle view detail
   */
  const handleView = (combo) => {
    setSelectedCombo(combo);
    setDetailModalVisible(true);
  };

  /**
   * Calculate total prices based on selected books
   */
  const calculateTotalPrices = () => {
    const formBooks = form.getFieldValue('books') || [];
    let totalOriginal = 0;
    let totalSale = 0;

    formBooks.forEach(item => {
      if (item && item.book && item.quantity) {
        const book = books.find(b => b._id === item.book);
        if (book) {
          totalOriginal += (book.originalPrice || 0) * item.quantity;
          totalSale += (book.salePrice || 0) * item.quantity;
        }
      }
    });

    return { totalOriginal, totalSale };
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
          alt="Combo"
          width={60}
          height={84}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Tên combo',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Sách trong combo',
      dataIndex: 'books',
      key: 'books',
      width: 300,
      render: (books) => (
        <div>
          {books.slice(0, 2).map((item, index) => (
            <Tag key={index} color="blue">
              {item.book?.title} (x{item.quantity})
            </Tag>
          ))}
          {books.length > 2 && <Tag>+{books.length - 2} sách khác</Tag>}
        </div>
      ),
    },
    {
      title: 'Giá gốc',
      dataIndex: 'totalOriginalPrice',
      key: 'totalOriginalPrice',
      render: (price) => <Text>{formatPrice(price)}</Text>,
    },
    {
      title: 'Giá combo',
      dataIndex: 'comboPrice',
      key: 'comboPrice',
      render: (price) => (
        <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
          {formatPrice(price)}
        </Text>
      ),
    },
    {
      title: 'Tiết kiệm',
      key: 'discount',
      render: (_, record) => {
        const discount = record.totalOriginalPrice - record.comboPrice;
        const percent = Math.round((discount / record.totalOriginalPrice) * 100);
        return (
          <Tag color="red">-{percent}%</Tag>
        );
      },
    },
    {
      title: 'Đã bán',
      dataIndex: 'soldCount',
      key: 'soldCount',
      render: (soldCount) => (
        <Text strong>{soldCount || 0}</Text>
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
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Chi tiết
          </Button>
          <Button
            type={record.isActive ? 'default' : 'primary'}
            size="small"
            icon={record.isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => handleToggleStatus(record._id, record.isActive)}
          >
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
            title="Xóa combo?"
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
    <div className="combo-management-page">
      <div className="page-header">
        <div>
          <Title level={2}>Quản lý combo</Title>
          <Text type="secondary">Tổng : {combos.length} combo</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreate}
        >
          Tạo combo mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={combos}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1500 }}
      />

      {/* Modal */}
      <Modal
        title={editingCombo ? 'Chỉnh sửa combo' : 'Tạo combo mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ books: [{ book: undefined, quantity: 1 }] }}
        >
          <Form.Item
            name="name"
            label="Tên combo"
            rules={[{ required: true, message: 'Vui lòng nhập tên combo!' }]}
          >
            <Input placeholder="Nhập tên combo" size="large" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Nhập mô tả combo" />
          </Form.Item>

          <Form.Item label="Sách trong combo">
            <Form.List name="books">
              {(fields, { add, remove }) => {
                const { totalOriginal, totalSale } = calculateTotalPrices();
                return (
                  <>
                    {fields.map(({ key, name, ...restField }) => {
                      const bookId = form.getFieldValue(['books', name, 'book']);
                      const quantity = form.getFieldValue(['books', name, 'quantity']) || 1;
                      const book = books.find(b => b._id === bookId);

                      return (
                        <div key={key} style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                          <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item
                              {...restField}
                              name={[name, 'book']}
                              rules={[{ required: true, message: 'Chọn sách!' }]}
                              style={{ width: 400, marginBottom: 0 }}
                            >
                              <Select
                                placeholder="Chọn sách"
                                showSearch
                                filterOption={(input, option) =>
                                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={books.map(book => ({
                                  value: book._id,
                                  label: book.title,
                                }))}
                                onChange={() => form.setFieldsValue({})}
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, 'quantity']}
                              rules={[{ required: true, message: 'Nhập số lượng!' }]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                min={1}
                                placeholder="SL"
                                style={{ width: 80 }}
                                onChange={() => form.setFieldsValue({})}
                              />
                            </Form.Item>

                            <MinusCircleOutlined onClick={() => remove(name)} />
                          </Space>

                          {book && (
                            <div style={{ marginLeft: 8, fontSize: 13 }}>
                              <Text type="secondary">
                                Giá gốc: <Text>{formatPrice(book.originalPrice)}</Text>
                                {' | '}
                                Giá giảm: <Text strong style={{ color: '#f5222d' }}>{formatPrice(book.salePrice)}</Text>
                                {' | '}
                                Tổng: <Text strong style={{ color: '#1890ff' }}>{formatPrice(book.salePrice * quantity)}</Text>
                              </Text>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {fields.length > 0 && (
                      <div style={{ padding: 12, background: '#e6f7ff', borderRadius: 8, marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          Tổng giá gốc: <Text>{formatPrice(totalOriginal)}</Text>
                          {' | '}
                          Tổng giá giảm: <Text strong style={{ color: '#f5222d', fontSize: 16 }}>{formatPrice(totalSale)}</Text>
                        </Text>
                      </div>
                    )}

                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                        Thêm sách
                      </Button>
                    </Form.Item>
                  </>
                );
              }}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="comboPrice"
            label="Giá combo"
            rules={[{ required: true, message: 'Vui lòng nhập giá combo!' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="₫"
              size="large"
            />
          </Form.Item>

          <Form.Item label="Hình ảnh combo">
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
              <Button type="primary" htmlType="submit" size="large">
                {editingCombo ? 'Cập nhật' : 'Tạo combo'}
              </Button>
              <Button onClick={() => setModalVisible(false)} size="large">
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết Combo"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          <Button onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        }
        width={900}
      >
        {selectedCombo && (
          <div>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              {selectedCombo.image && (
                <Image
                  src={selectedCombo.image}
                  alt={selectedCombo.name}
                  width={200}
                  style={{ borderRadius: 8 }}
                />
              )}
            </div>

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên combo" span={2}>
                <Text strong style={{ fontSize: 16 }}>{selectedCombo.name}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Mô tả" span={2}>
                {selectedCombo.description || 'Chưa có mô tả'}
              </Descriptions.Item>

              <Descriptions.Item label="Giá gốc">
                <Text style={{ fontSize: 16 }}>{formatPrice(selectedCombo.totalOriginalPrice)}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Giá combo">
                <Text strong style={{ color: '#f5222d', fontSize: 18 }}>
                  {formatPrice(selectedCombo.comboPrice)}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Tiết kiệm">
                <Tag color="red" style={{ fontSize: 14 }}>
                  -{Math.round(((selectedCombo.totalOriginalPrice - selectedCombo.comboPrice) / selectedCombo.totalOriginalPrice) * 100)}%
                </Tag>
                <Text style={{ marginLeft: 8 }}>
                  ({formatPrice(selectedCombo.totalOriginalPrice - selectedCombo.comboPrice)})
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedCombo.isActive ? 'success' : 'default'}>
                  {selectedCombo.isActive ? 'Đang bán' : 'Ngừng bán'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>Sách trong combo ({selectedCombo.books.length})</Title>
              <Table
                dataSource={selectedCombo.books}
                rowKey={(item, index) => index}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Hình ảnh',
                    dataIndex: ['book', 'images'],
                    key: 'image',
                    width: 80,
                    render: (images) => (
                      images?.[0] && (
                        <Image
                          src={images[0]}
                          alt="Book"
                          width={50}
                          height={70}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                        />
                      )
                    ),
                  },
                  {
                    title: 'Tên sách',
                    dataIndex: ['book', 'title'],
                    key: 'title',
                    render: (title) => <Text strong>{title || 'N/A'}</Text>,
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: 100,
                    align: 'center',
                    render: (qty) => <Tag color="blue">x{qty}</Tag>,
                  },
                  {
                    title: 'Giá gốc',
                    dataIndex: ['book', 'originalPrice'],
                    key: 'originalPrice',
                    width: 120,
                    render: (price) => <Text>{formatPrice(price)}</Text>,
                  },
                  {
                    title: 'Giá giảm',
                    dataIndex: ['book', 'salePrice'],
                    key: 'salePrice',
                    width: 120,
                    render: (price) => (
                      <Text strong style={{ color: '#f5222d' }}>{formatPrice(price)}</Text>
                    ),
                  },
                  {
                    title: 'Thành tiền',
                    key: 'subtotal',
                    width: 120,
                    render: (_, record) => (
                      <Text strong style={{ color: '#1890ff' }}>
                        {formatPrice((record.book?.salePrice || 0) * record.quantity)}
                      </Text>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComboManagementPage;