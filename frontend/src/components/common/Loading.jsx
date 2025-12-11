
import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './Loading.scss';

/**
 * Loading Component
 * @param {Object} props
 * @param {String} props.size - 'small' | 'default' | 'large'
 * @param {String} props.tip - Loading text
 * @param {Boolean} props.fullScreen - Full screen loading
 */
const Loading = ({ size = 'large', tip = 'Đang tải...', fullScreen = false }) => {
  // Custom icon với size tùy chỉnh
  const iconSize = size === 'small' ? 24 : size === 'large' ? 48 : 32;
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: iconSize,
        color: '#1890ff'
      }}
      spin
    />
  );

  // FULLSCREEN LOADING
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-content">
          <Spin indicator={antIcon} size={size} />
          <p className="loading-tip">{tip}</p>
        </div>
      </div>
    );
  }

  // NORMAL LOADING
  return (
    <div className="loading-container">
      <Spin indicator={antIcon} size={size} tip={tip} />
    </div>
  );
};

export default Loading;