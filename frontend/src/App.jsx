/**
 * ==============================================
 * MAIN APP COMPONENT
 * ==============================================
 * Component chính của app
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import store from '@redux/store';
import Header from '@components/common/Header';
import Footer from '@components/common/Footer';
import AppRoutes from '@routes/AppRoutes';
import '@styles/global.scss';
import './App.scss';

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
          <div className="app">
            <Header />
            <main className="app-main">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;