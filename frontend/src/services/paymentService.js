import api from './api';

export const paymentService = {
  /**
   * Initiate payment
   */
  initiatePayment: async (bookingId, paymentMethod = 'card') => {
    const response = await api.post('/payments/initiate', {
      booking_id: bookingId,
      payment_method: paymentMethod,
    });
    return response.data;
  },

  /**
   * Confirm payment
   */
  confirmPayment: async (bookingId, paymentIntentId, transactionId = null) => {
    const response = await api.post('/payments/confirm', {
      booking_id: bookingId,
      payment_intent_id: paymentIntentId,
      transaction_id: transactionId,
    });
    return response.data;
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/payments/history?${params.toString()}`);
    return response.data;
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
};
