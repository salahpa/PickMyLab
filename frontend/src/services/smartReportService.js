import api from './api';

export const smartReportService = {
  /**
   * Get smart report
   */
  getSmartReport: async (reportId) => {
    const response = await api.get(`/reports/${reportId}/smart`);
    return response.data;
  },

  /**
   * Generate smart report
   */
  generateSmartReport: async (reportId) => {
    const response = await api.post(`/reports/${reportId}/smart/generate`);
    return response.data;
  },
};
