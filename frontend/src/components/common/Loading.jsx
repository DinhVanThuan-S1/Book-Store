/**
 * ==============================================
 * LOADING COMPONENT
 * ==============================================
 * Component hiển thị loading spinner
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

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
  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <Spin indicator={antIcon} size={size} tip={tip} />
      </div>
    );
  }

  return (
    <div className="loading-container">
      <Spin indicator={antIcon} size={size} tip={tip} />
    </div>
  );
};

export default Loading;