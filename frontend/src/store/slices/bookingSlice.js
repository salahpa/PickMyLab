import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../../services/bookingService';

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
  pagination: null,
};

// Async thunks
export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to create booking'
      );
    }
  }
);

export const getUserBookings = createAsyncThunk(
  'booking/getUserBookings',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await bookingService.getUserBookings(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch bookings'
      );
    }
  }
);

export const getBookingById = createAsyncThunk(
  'booking/getById',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingById(bookingId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch booking'
      );
    }
  }
);

export const getBookingTracking = createAsyncThunk(
  'booking/getTracking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingTracking(bookingId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch tracking'
      );
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      const response = await bookingService.cancelBooking(bookingId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to cancel booking'
      );
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get user bookings
    builder
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get booking by ID
    builder
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Cancel booking
    builder
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
      });
  },
});

export const { clearCurrentBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
