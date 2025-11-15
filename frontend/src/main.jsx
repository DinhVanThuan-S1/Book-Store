/**
 * ==============================================
 * MAIN ENTRY POINT
 * ==============================================
 * Entry point của React app
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // ⭐ Load global CSS trước
import 'antd/dist/reset.css'; // ⭐ Ant Design styles sau
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);