import api from './api';

export const adminService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (dateFrom = null, dateTo = null) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const response = await api.get(`/admin/dashboard/stats?${params.toString()}`);
    return response.data;
  },

  /**
   * Get all bookings
   */
  getAllBookings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/admin/bookings?${params.toString()}`);
    return response.data;
  },

  /**
   * Update booking status
   */
  updateBookingStatus: async (bookingId, status, notes = null) => {
    const response = await api.put(`/admin/bookings/${bookingId}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  /**
   * Get all users
   */
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.user_type) params.append('user_type', filters.user_type);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  /**
   * Update user status
   */
  updateUserStatus: async (userId, isActive) => {
    const response = await api.put(`/admin/users/${userId}/status`, {
      is_active: isActive,
    });
    return response.data;
  },

  /**
   * Get FAQs
   */
  getFAQs: async () => {
    const response = await api.get('/admin/faqs');
    return response.data;
  },

  /**
   * Create FAQ
   */
  createFAQ: async (faqData) => {
    const response = await api.post('/admin/faqs', faqData);
    return response.data;
  },

  /**
   * Update FAQ
   */
  updateFAQ: async (faqId, faqData) => {
    const response = await api.put(`/admin/faqs/${faqId}`, faqData);
    return response.data;
  },

  /**
   * Delete FAQ
   */
  deleteFAQ: async (faqId) => {
    const response = await api.delete(`/admin/faqs/${faqId}`);
    return response.data;
  },

  /**
   * Get Terms & Conditions
   */
  getTerms: async () => {
    const response = await api.get('/admin/terms');
    return response.data;
  },

  /**
   * Update Terms & Conditions
   */
  updateTerms: async (termsData) => {
    const response = await api.put('/admin/terms', termsData);
    return response.data;
  },
};
