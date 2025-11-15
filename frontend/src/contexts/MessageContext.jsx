/**
 * ==============================================
 * MESSAGE CONTEXT
 * ==============================================
 * Context để sử dụng Ant Design message API với App context
 */

import React, { createContext, useContext } from 'react';
import { App } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, WarningFilled, InfoCircleFilled } from '@ant-design/icons';

const MessageContext = createContext(null);

/**
 * Provider cung cấp message API từ Ant Design App
 */
export const MessageProvider = ({ children }) => {
  const { notification, modal } = App.useApp();

  // Sử dụng notification thay vì message để có nút đóng và vị trí góc phải
  const message = {
    success: (content, duration = 4) => {
      notification.success({
        message: 'Thành công',
        description: content,
        placement: 'topRight',
        duration,
        icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
        className: 'custom-notification-success',
        style: {
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)',
        },
      });
    },

    error: (content, duration = 5) => {
      notification.error({
        message: 'Lỗi',
        description: content,
        placement: 'topRight',
        duration,
        icon: <CloseCircleFilled style={{ color: '#ff4d4f' }} />,
        className: 'custom-notification-error',
        style: {
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.15)',
        },
      });
    },

    warning: (content, duration = 4) => {
      notification.warning({
        message: 'Cảnh báo',
        description: content,
        placement: 'topRight',
        duration,
        icon: <WarningFilled style={{ color: '#faad14' }} />,
        className: 'custom-notification-warning',
        style: {
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(250, 173, 20, 0.15)',
        },
      });
    },

    info: (content, duration = 4) => {
      notification.info({
        message: 'Thông tin',
        description: content,
        placement: 'topRight',
        duration,
        icon: <InfoCircleFilled style={{ color: '#1890ff' }} />,
        className: 'custom-notification-info',
        style: {
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
        },
      });
    },

    loading: (content, duration = 0) => {
      return notification.info({
        message: 'Đang xử lý',
        description: content,
        placement: 'topRight',
        duration,
        icon: <InfoCircleFilled style={{ color: '#1890ff' }} />,
        style: {
          borderRadius: '8px',
        },
      });
    },
  };

  return (
    <MessageContext.Provider value={{ message, notification, modal }}>
      {children}
    </MessageContext.Provider>
  );
};

/**
 * Hook để sử dụng message API
 * @returns {{ message, notification, modal }}
 */
export const useMessage = () => {
  const context = useContext(MessageContext);

  if (!context) {
    throw new Error('useMessage must be used within MessageProvider');
  }

  return context;
};

// Default export cho backward compatibility
export default MessageContext;
