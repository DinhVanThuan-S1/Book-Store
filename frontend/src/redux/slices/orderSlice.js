/**
 * ==============================================
 * ORDER SLICE
 * ==============================================
 * Redux slice cho đơn hàng
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderApi } from '@api';

const initialState = {
  orders: [],
  currentOrder: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  loading: false,
  error: null,
};

/**
 * Async Thunks
 */

// Tạo đơn hàng
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderApi.createOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy danh sách đơn hàng của tôi
export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderApi.getMyOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy chi tiết đơn hàng
export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrderById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Hủy đơn hàng
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ id, cancelReason }, { rejectWithValue }) => {
    try {
      const response = await orderApi.cancelOrder(id, cancelReason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Order Slice
 */
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Clear error
    clearOrderError: (state) => {
      state.error = null;
    },
    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch my orders
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        // Backend trả về { order, payment }
        // Gắn payment vào order để dễ truy cập
        state.currentOrder = {
          ...action.payload.order,
          payment: action.payload.payment,
        };
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Cancel order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Update current order if it's the one being cancelled
        if (state.currentOrder?._id === action.payload.order._id) {
          state.currentOrder = action.payload.order;
        }
        // Update in orders list
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;