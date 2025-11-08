/**
 * ==============================================
 * MAIN APP COMPONENT - FIXED
 * ==============================================
 * Component chính - KHÔNG render Header/Footer ở đây
 */

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import store from '@redux/store';
import AppRoutes from '@routes/AppRoutes';
import '@styles/global.scss';
import './App.scss';
import ErrorBoundary from '@components/common/ErrorBoundary';

/**
 * App Component
 */
function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: '#4F46E5',
            borderRadius: 8,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
          },
        }}
      >
        <Router>
          <ErrorBoundary>
            <div className="app">
              {/* KHÔNG render Header/Footer ở đây */}
              <AppRoutes />
            </div>
          </ErrorBoundary>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;