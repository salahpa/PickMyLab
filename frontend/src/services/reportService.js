import api from './api';

export const reportService = {
  /**
   * Get user reports
   */
  getUserReports: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.test_id) params.append('test_id', filters.test_id);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
  },

  /**
   * Get report by ID
   */
  getReportById: async (reportId) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  },

  /**
   * Download report
   */
  downloadReport: async (reportId) => {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    
    // Create blob and download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${reportId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  },

  /**
   * Share report
   */
  shareReport: async (reportId, email, expiryDays = 7) => {
    const response = await api.post(`/reports/${reportId}/share`, {
      email,
      expiry_days: expiryDays,
    });
    return response.data;
  },
};
