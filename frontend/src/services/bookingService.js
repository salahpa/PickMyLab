import api from './api';

export const bookingService = {
  /**
   * Create new booking
   */
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  /**
   * Get user bookings
   */
  getUserBookings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/bookings?${params.toString()}`);
    return response.data;
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Get booking tracking
   */
  getBookingTracking: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}/tracking`);
    return response.data;
  },

  /**
   * Cancel booking
   */
  cancelBooking: async (bookingId, reason) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },
};
