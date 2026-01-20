import api from './api';

export const addressService = {
  /**
   * Get all user addresses
   */
  getAddresses: async () => {
    const response = await api.get('/addresses');
    return response.data;
  },

  /**
   * Create new address
   */
  createAddress: async (addressData) => {
    const response = await api.post('/addresses', addressData);
    return response.data;
  },

  /**
   * Update address
   */
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/addresses/${addressId}`, addressData);
    return response.data;
  },

  /**
   * Delete address
   */
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  },
};
