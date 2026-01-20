import api from './api';

export const testService = {
  /**
   * Get all test categories
   */
  getCategories: async () => {
    const response = await api.get('/tests/categories');
    return response.data;
  },

  /**
   * Get all tests with filters
   */
  getTests: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.lab_partner_id) params.append('lab_partner_id', filters.lab_partner_id);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.sample_type) params.append('sample_type', filters.sample_type);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/tests?${params.toString()}`);
    return response.data;
  },

  /**
   * Get test by ID
   */
  getTestById: async (testId) => {
    const response = await api.get(`/tests/${testId}`);
    return response.data;
  },

  /**
   * Get popular tests
   */
  getPopularTests: async (limit = 10) => {
    const response = await api.get(`/tests/popular?limit=${limit}`);
    return response.data;
  },

  /**
   * Get test bundles
   */
  getBundles: async () => {
    const response = await api.get('/tests/bundles');
    return response.data;
  },

  /**
   * Get bundle by ID
   */
  getBundleById: async (bundleId) => {
    const response = await api.get(`/tests/bundles/${bundleId}`);
    return response.data;
  },
};
