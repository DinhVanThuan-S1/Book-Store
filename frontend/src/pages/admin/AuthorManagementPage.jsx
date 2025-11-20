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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { authorApi } from '@api';
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
    });
    setFileList(author.image ? [{ url: author.image }] : []);
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

      if (editingAuthor) {
        await authorApi.updateAuthor(editingAuthor._id, data);
        message.success('Cập nhật tác giả thành công');
      } else {
        await authorApi.createAuthor(data);
        message.success('Tạo tác giả thành công');
      }

      setModalVisible(false);
      fetchAuthors();
    } catch (error) {
      message.error(error || 'Không thể lưu tác giả');
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
      message.error('Không thể xóa tác giả');
    }
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
      title: 'Số sách',
      dataIndex: 'bookCount',
      key: 'bookCount',
      render: (count) => count || 0,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
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
            title="Xóa tác giả?"
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

          <Form.Item label="Ảnh đại diện">
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
              <Button type="primary" htmlType="submit">
                {editingAuthor ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AuthorManagementPage;