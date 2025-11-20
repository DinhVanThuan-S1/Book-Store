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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { comboApi, bookApi } from '@api';
import { formatPrice } from '@utils/formatPrice';
import './ComboManagementPage.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ComboManagementPage = () => {
  const [combos, setCombos] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  /**
   * Fetch combos
   */
  const fetchCombos = async () => {
    try {
      setLoading(true);
      const response = await comboApi.getCombos();
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
      const data = {
        ...values,
        image: fileList.length > 0 ? fileList[0].url : null,
      };

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
      message.error(error || 'Không thể lưu combo');
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
          <Title level={2}>Quản lý Combo</Title>
          <Text type="secondary">Tổng số: {combos.length} combo</Text>
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
        scroll={{ x: 1200 }}
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
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'book']}
                        rules={[{ required: true, message: 'Chọn sách!' }]}
                        style={{ width: 400 }}
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
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: 'Nhập số lượng!' }]}
                      >
                        <InputNumber min={1} placeholder="SL" style={{ width: 80 }} />
                      </Form.Item>

                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                      Thêm sách
                    </Button>
                  </Form.Item>
                </>
              )}
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
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
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
    </div>
  );
};

export default ComboManagementPage;