/**
 * ==============================================
 * CART SLICE
 * ==============================================
 * Redux slice cho giỏ hàng
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '@api';

const initialState = {
  cart: null,
  items: [],
  totalPrice: 0,
  itemCount: 0,
  loading: false,
  error: null,
};

/**
 * Async Thunks
 */

// Lấy giỏ hàng
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thêm vào giỏ hàng
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data, { rejectWithValue }) => {
    try {
      const response = await cartApi.addToCart(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cập nhật số lượng
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartApi.updateCartItem(itemId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Xóa item
export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await cartApi.removeCartItem(itemId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Xóa toàn bộ giỏ
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.clearCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Cart Slice
 */
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Clear error
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.items = action.payload.cart.items || [];
        state.totalPrice = action.payload.cart.totalPrice || 0;
        state.itemCount = action.payload.cart.items?.length || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.items = action.payload.cart.items || [];
        state.totalPrice = action.payload.cart.totalPrice || 0;
        state.itemCount = action.payload.cart.items?.length || 0;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Update cart item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.items = action.payload.cart.items || [];
        state.totalPrice = action.payload.cart.totalPrice || 0;
        state.itemCount = action.payload.cart.items?.length || 0;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Remove cart item
    builder
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.items = action.payload.cart.items || [];
        state.totalPrice = action.payload.cart.totalPrice || 0;
        state.itemCount = action.payload.cart.items?.length || 0;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Clear cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.items = [];
        state.totalPrice = 0;
        state.itemCount = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;