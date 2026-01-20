import api from './api';

export const labService = {
  /**
   * Get all lab partners
   */
  getLabPartners: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.service_zone) params.append('service_zone', filters.service_zone);
    if (filters.min_rating) params.append('min_rating', filters.min_rating);

    const response = await api.get(`/labs?${params.toString()}`);
    return response.data;
  },

  /**
   * Get lab partner by ID
   */
  getLabPartnerById: async (labId) => {
    const response = await api.get(`/labs/${labId}`);
    return response.data;
  },

  /**
   * Get lab partner tests
   */
  getLabPartnerTests: async (labId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/labs/${labId}/tests?${params.toString()}`);
    return response.data;
  },
};
