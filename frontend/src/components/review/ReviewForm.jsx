/**
 * ==============================================
 * REVIEW FORM COMPONENT
 * ==============================================
 * Form để tạo đánh giá sách
 */

import React, { useState } from 'react';
import { Modal, Form, Rate, Input, Upload, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { reviewApi } from '@api';
import { showSuccess, showError } from '@utils/notification';
import './ReviewForm.scss';

const { TextArea } = Input;

/**
 * ReviewForm Component
 * @param {Object} props
 * @param {Boolean} props.visible - Modal visible
 * @param {Function} props.onClose - Callback đóng modal
 * @param {Object} props.book - Thông tin sách
 * @param {String} props.orderId - ID đơn hàng
 * @param {Function} props.onSuccess - Callback khi tạo thành công
 */
const ReviewForm = ({ visible, onClose, book, orderId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  /**
   * Handle form submit
   */
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // TODO: Upload images to server/cloudinary
      const imageUrls = fileList.map((file) => file.url || file.thumbUrl);

      await reviewApi.createReview({
        bookId: book._id,
        orderId,
        rating: values.rating,
        title: values.title,
        comment: values.comment,
        images: imageUrls,
      });

      showSuccess('Đánh giá thành công!');
      form.resetFields();
      setFileList([]);
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showError(error || 'Không thể tạo đánh giá');
    } finally {
      setLoading(false);
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

  return (
    <Modal
      title="Đánh giá sản phẩm"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="review-form-modal"
    >
      <div className="review-form">
        {/* Book Info */}
        <div className="book-info">
          <img src={book?.images?.[0]} alt={book?.title} className="book-image" />
          <div className="book-details">
            <div className="book-title">{book?.title}</div>
            <div className="book-author">{book?.author?.name}</div>
          </div>
        </div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ rating: 5 }}
        >
          {/* Rating */}
          <Form.Item
            name="rating"
            label="Đánh giá của bạn"
            rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
          >
            <Rate style={{ fontSize: 32 }} />
          </Form.Item>

          {/* Title */}
          <Form.Item
            name="title"
            label="Tiêu đề đánh giá"
            rules={[
              { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự!' },
            ]}
          >
            <Input placeholder="Tóm tắt đánh giá của bạn..." />
          </Form.Item>

          {/* Comment */}
          <Form.Item
            name="comment"
            label="Nội dung đánh giá"
            rules={[
              { max: 2000, message: 'Nội dung không được vượt quá 2000 ký tự!' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            />
          </Form.Item>

          {/* Images */}
          <Form.Item label="Hình ảnh (tối đa 5 ảnh)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false} // Prevent auto upload
              maxCount={5}
            >
              {fileList.length >= 5 ? null : uploadButton}
            </Upload>
          </Form.Item>

          {/* Submit */}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi đánh giá
              </Button>
              <Button onClick={onClose}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ReviewForm;