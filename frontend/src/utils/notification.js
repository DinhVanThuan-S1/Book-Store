/**
 * ==============================================
 * NOTIFICATION UTILITY
 * ==============================================
 * Export hook để sử dụng message API từ MessageContext
 */

import { message as antdMessage, notification as antdNotification } from 'antd';

// Export hook chính (dùng trong React components)
export { useMessage } from '@contexts/MessageContext';

// ⚠️ DEPRECATED: Legacy static functions cho backward compatibility
// Dùng tạm để không phá vỡ code cũ, nhưng nên migrate sang useMessage hook

/**
 * @deprecated Sử dụng useMessage() hook thay thế
 */
export const showSuccess = (content) => {
  antdMessage.success(content);
};

/**
 * @deprecated Sử dụng useMessage() hook thay thế
 */
export const showError = (content) => {
  antdMessage.error(content);
};

/**
 * @deprecated Sử dụng useMessage() hook thay thế
 */
export const showWarning = (content) => {
  antdMessage.warning(content);
};

/**
 * @deprecated Sử dụng useMessage() hook thay thế
 */
export const showInfo = (content) => {
  antdMessage.info(content);
};

/**
 * @deprecated Sử dụng useMessage() hook thay thế
 */
export const showLoading = (content, duration = 0) => {
  return antdMessage.loading(content, duration);
};

/**
 * @deprecated Sử dụng useMessage() hook thay thế
 */
export const showNotification = (type, title, description) => {
  antdNotification[type]({
    message: title,
    description: description,
    placement: 'topRight',
    duration: 4.5,
  });
};

/**
 * Helper functions để sử dụng với useMessage hook
 * 
 * Cách dùng trong component:
 * 
 * import { useMessage } from '@utils/notification';
 * 
 * const MyComponent = () => {
 *   const { message } = useMessage();
 *   
 *   const handleClick = () => {
 *     message.success('Thành công!');
 *   };
 *   
 *   return <button onClick={handleClick}>Click me</button>;
 * };
 */