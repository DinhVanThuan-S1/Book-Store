/**
 * ==============================================
 * CUSTOMER LAYOUT
 * ==============================================
 * Layout cho customer pages (Header + Content + Footer)
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const CustomerLayout = () => {
  return (
    <div className="customer-layout">
      <Header />
      <main className="customer-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;