/**
 * ==============================================
 * BOOK SLICE
 * ==============================================
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookApi } from '@api';

const initialState = {
  books: [],
  currentBook: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
  filters: {
    category: null,
    author: null,
    minPrice: null,
    maxPrice: null,
    search: '',
    sortBy: '-createdAt',
  },
  loading: false,
  error: null,
};

/**
 * Async Thunks
 */

// Lấy danh sách sách
export const fetchBooks = createAsyncThunk(
  'book/fetchBooks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookApi.getBooks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy chi tiết sách
export const fetchBookById = createAsyncThunk(
  'book/fetchBookById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookApi.getBookById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    // Clear current book
    clearCurrentBook: (state) => {
      state.currentBook = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch books
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.books;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch book by ID
    builder
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload.book;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentBook } = bookSlice.actions;
export default bookSlice.reducer;