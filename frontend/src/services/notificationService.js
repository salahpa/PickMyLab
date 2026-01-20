import api from './api';

export const notificationService = {
  /**
   * Get user notifications
   */
  getUserNotifications: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  /**
   * Get notification preferences
   */
  getNotificationPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (preferences) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },
};
