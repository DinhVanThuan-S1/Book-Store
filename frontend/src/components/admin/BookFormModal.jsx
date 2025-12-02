/**
 * ==============================================
 * BOOK FORM MODAL
 * ==============================================
 * Modal tạo/chỉnh sửa sách
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Space,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { bookApi, categoryApi } from '@api';
import { useMessage } from '@utils/notification';

const { TextArea } = Input;
const { Option } = Select;

/**
 * BookFormModal Component
 * @param {Object} props
 * @param {Boolean} props.visible
 * @param {Function} props.onClose
 * @param {Function} props.onSuccess
 * @param {Object} props.book - Book to edit (null for create)
 */
const BookFormModal = ({ visible, onClose, onSuccess, book = null }) => {
  const { message } = useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);

  const isEditMode = !!book;

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
   * Set form values when editing
   */
  useEffect(() => {
    if (book && visible) {
      form.setFieldsValue({
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
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [book, visible, form]);

  /**
   * Handle submit
   */
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Prepare data
      const bookData = {
        ...values,
        images: fileList.map((file) => file.url || file.response?.url),
      };

      if (isEditMode) {
        await bookApi.updateBook(book._id, bookData);
        message.success('Cập nhật sách thành công');
      } else {
        await bookApi.createBook(bookData);
        message.success('Tạo sách mới thành công');
      }

      form.resetFields();
      setFileList([]);
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error(error || 'Không thể lưu sách');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload config
   */
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <Modal
      title={isEditMode ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="Tên sách"
          rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
        >
          <Input placeholder="Nhập tên sách" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
        >
          <Select placeholder="Chọn danh mục">
            {categories.map((cat) => (
              <Option key={cat._id} value={cat._id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <TextArea rows={4} placeholder="Nhập mô tả sách" />
        </Form.Item>

        <Form.Item
          name="isbn"
          label="ISBN"
        >
          <Input placeholder="Nhập mã ISBN" />
        </Form.Item>

        <Space style={{ width: '100%' }}>
          <Form.Item
            name="publishYear"
            label="Năm xuất bản"
          >
            <InputNumber
              min={1900}
              max={new Date().getFullYear() + 1}
              style={{ width: 150 }}
            />
          </Form.Item>

          <Form.Item
            name="pages"
            label="Số trang"
          >
            <InputNumber min={1} style={{ width: 150 }} />
          </Form.Item>
        </Space>

        <Form.Item
          name="language"
          label="Ngôn ngữ"
        >
          <Select placeholder="Chọn ngôn ngữ">
            <Option value="Vietnamese">Tiếng Việt</Option>
            <Option value="English">Tiếng Anh</Option>
            <Option value="Other">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="format"
          label="Hình thức"
        >
          <Select placeholder="Chọn hình thức">
            <Option value="paperback">Bìa mềm</Option>
            <Option value="hardcover">Bìa cứng</Option>
            <Option value="ebook">Sách điện tử</Option>
          </Select>
        </Form.Item>

        <Space style={{ width: '100%' }}>
          <Form.Item
            name="originalPrice"
            label="Giá gốc"
            rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
          >
            <InputNumber
              min={0}
              style={{ width: 200 }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
            />
          </Form.Item>

          <Form.Item
            name="salePrice"
            label="Giá bán"
            rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
          >
            <InputNumber
              min={0}
              style={{ width: 200 }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
            />
          </Form.Item>
        </Space>

        <Form.Item label="Hình ảnh">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
            maxCount={5}
          >
            {fileList.length >= 5 ? null : uploadButton}
          </Upload>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </Button>
            <Button onClick={onClose}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookFormModal;
