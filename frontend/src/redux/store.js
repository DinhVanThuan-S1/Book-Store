/**
 * ==============================================
 * REDUX STORE
 * ==============================================
 * Cấu hình Redux store với Redux Toolkit
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookReducer from './slices/bookSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';

/**
 * Configure Store
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    book: bookReducer,
    cart: cartReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['your/action/type'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production', // Enable DevTools trong development
});

export default store;