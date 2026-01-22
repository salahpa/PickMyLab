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

  /**
   * ============================================
   * TEST CATEGORIES MANAGEMENT
   * ============================================
   */
  getAllCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/admin/categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/admin/categories/${categoryId}`);
    return response.data;
  },

  /**
   * ============================================
   * TESTS MANAGEMENT
   * ============================================
   */
  getAllTestsAdmin: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/admin/tests?${params.toString()}`);
    return response.data;
  },

  createTest: async (testData) => {
    const response = await api.post('/admin/tests', testData);
    return response.data;
  },

  updateTest: async (testId, testData) => {
    const response = await api.put(`/admin/tests/${testId}`, testData);
    return response.data;
  },

  deleteTest: async (testId) => {
    const response = await api.delete(`/admin/tests/${testId}`);
    return response.data;
  },

  /**
   * ============================================
   * LAB PARTNERS MANAGEMENT
   * ============================================
   */
  getAllLabPartners: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/admin/lab-partners?${params.toString()}`);
    return response.data;
  },

  createLabPartner: async (labData) => {
    const response = await api.post('/admin/lab-partners', labData);
    return response.data;
  },

  updateLabPartner: async (labId, labData) => {
    const response = await api.put(`/admin/lab-partners/${labId}`, labData);
    return response.data;
  },

  deleteLabPartner: async (labId) => {
    const response = await api.delete(`/admin/lab-partners/${labId}`);
    return response.data;
  },

  /**
   * ============================================
   * TEST PRICING MANAGEMENT
   * ============================================
   */
  getTestPricing: async (labPartnerId, testId = null) => {
    const params = new URLSearchParams();
    if (testId) params.append('test_id', testId);
    const response = await api.get(`/admin/lab-partners/${labPartnerId}/pricing?${params.toString()}`);
    return response.data;
  },

  upsertTestPricing: async (pricingData) => {
    const response = await api.post('/admin/pricing', pricingData);
    return response.data;
  },

  deleteTestPricing: async (pricingId) => {
    const response = await api.delete(`/admin/pricing/${pricingId}`);
    return response.data;
  },
};
