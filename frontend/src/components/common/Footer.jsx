/**
 * ==============================================
 * FOOTER COMPONENT
 * ==============================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Row, Col, Space } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import './Footer.scss';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter className="footer">
      <div className="footer-container">
        <Row gutter={[32, 32]}>
          {/* About */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h3 className="footer-title">Về chúng tôi</h3>
              <p className="footer-description">
                BookStore - Nơi kết nối độc giả với tri thức.
                Cung cấp hàng nghìn đầu sách chất lượng với giá tốt nhất.
              </p>
              <Space size="large" className="footer-social">
                <a href="#" aria-label="Facebook">
                  <FacebookOutlined />
                </a>
                <a href="#" aria-label="Twitter">
                  <TwitterOutlined />
                </a>
                <a href="#" aria-label="Instagram">
                  <InstagramOutlined />
                </a>
                <a href="#" aria-label="Youtube">
                  <YoutubeOutlined />
                </a>
              </Space>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h3 className="footer-title">Liên kết nhanh</h3>
              <ul className="footer-links">
                <li><Link to="/books">Sách mới</Link></li>
                <li><Link to="/books?sortBy=-purchaseCount">Bán chạy</Link></li>
                <li><Link to="/about">Giới thiệu</Link></li>
                <li><Link to="/contact">Liên hệ</Link></li>
                <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
              </ul>
            </div>
          </Col>

          {/* Customer Support */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h3 className="footer-title">Hỗ trợ khách hàng</h3>
              <ul className="footer-links">
                <li><Link to="/shipping-policy">Chính sách giao hàng</Link></li>
                <li><Link to="/return-policy">Chính sách đổi trả</Link></li>
                <li><Link to="/payment-guide">Hướng dẫn thanh toán</Link></li>
                <li><Link to="/privacy-policy">Chính sách bảo mật</Link></li>
                <li><Link to="/terms">Điều khoản sử dụng</Link></li>
              </ul>
            </div>
          </Col>

          {/* Contact */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <h3 className="footer-title">Liên hệ</h3>
              <ul className="footer-contact">
                <li>
                  <EnvironmentOutlined />
                  <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
                </li>
                <li>
                  <PhoneOutlined />
                  <span>0123 456 789</span>
                </li>
                <li>
                  <MailOutlined />
                  <span>support@bookstore.vn</span>
                </li>
              </ul>
            </div>
          </Col>
        </Row>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>© 2025 BookStore. All rights reserved.</p>
          <p>Developed by <strong>DinhVanThuan-S1</strong></p>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;