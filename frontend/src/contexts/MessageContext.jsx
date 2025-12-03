/**
 * ==============================================
 * MESSAGE CONTEXT
 * ==============================================
 * Context để sử dụng Ant Design message API với App context
 */

import React, { createContext, useContext } from 'react';
import { App } from 'antd';

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
        message: content,
        description: null,
        placement: 'topRight',
        duration,
        icon: null,
        className: 'custom-notification-success',
        style: {
          borderRadius: '8px',
          background: '#52c41a',
          color: '#ffffff',
        },
      });
    },

    error: (content, duration = 5) => {
      notification.error({
        message: content,
        description: null,
        placement: 'topRight',
        duration,
        icon: null,
        className: 'custom-notification-error',
        style: {
          borderRadius: '8px',
          background: '#ff4d4f',
          color: '#ffffff',
        },
      });
    },

    warning: (content, duration = 4) => {
      notification.warning({
        message: content,
        description: null,
        placement: 'topRight',
        duration,
        icon: null,
        className: 'custom-notification-warning',
        style: {
          borderRadius: '8px',
          background: '#faad14',
          color: '#ffffff',
        },
      });
    },

    info: (content, duration = 4) => {
      notification.info({
        message: content,
        description: null,
        placement: 'topRight',
        duration,
        icon: null,
        className: 'custom-notification-info',
        style: {
          borderRadius: '8px',
          background: '#1890ff',
          color: '#ffffff',
        },
        closeIcon: <span style={{ color: '#ffffff' }}>✕</span>,
      });
    },

    loading: (content, duration = 0) => {
      return notification.info({
        message: content,
        description: null,
        placement: 'topRight',
        duration,
        icon: null,
        className: 'custom-notification-info',
        style: {
          borderRadius: '8px',
          background: '#1890ff',
          color: '#ffffff',
        },
        closeIcon: <span style={{ color: '#ffffff' }}>✕</span>,
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
