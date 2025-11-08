/**
 * ==============================================
 * ERROR BOUNDARY COMPONENT
 * ==============================================
 * Catch React errors và hiển thị fallback UI
 */

import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <Result
            status="500"
            title="Oops! Có lỗi xảy ra"
            subTitle="Xin lỗi, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau."
            extra={
              <Button
                type="primary"
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;