/**
 * ==============================================
 * NOT FOUND PAGE (404)
 * ==============================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { Layout } from 'antd';

const { Content } = Layout;

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result
          status="404"
          title="404"
          subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại."
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          }
        />
      </Content>
    </Layout>
  );
};

export default NotFoundPage;