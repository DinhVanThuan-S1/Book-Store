

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import './NotFoundPage.scss';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại."
        extra={
          <div className="button-group">
            <Button type="primary" size="large" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
            <Button size="large" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default NotFoundPage;