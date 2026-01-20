const addressService = require('../services/addressService');
const logger = require('../utils/logger');

/**
 * Get all user addresses
 */
const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addresses = await addressService.getUserAddresses(userId);

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    logger.error('Get addresses controller error:', error);
    next(error);
  }
};

/**
 * Create new address
 */
const createAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { address_line1, address_line2, city, state, postal_code, country, latitude, longitude, address_type, is_default } = req.body;

    if (!address_line1 || !city) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Address line 1 and city are required',
        },
      });
    }

    const address = await addressService.createAddress(userId, {
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      latitude,
      longitude,
      address_type,
      is_default,
    });

    res.status(201).json({
      success: true,
      data: address,
      message: 'Address created successfully',
    });
  } catch (error) {
    logger.error('Create address controller error:', error);
    next(error);
  }
};

/**
 * Update address
 */
const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const updateData = req.body;

    const address = await addressService.updateAddress(userId, addressId, updateData);

    res.json({
      success: true,
      data: address,
      message: 'Address updated successfully',
    });
  } catch (error) {
    logger.error('Update address controller error:', error);

    if (error.message === 'Address not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    next(error);
  }
};

/**
 * Delete address
 */
const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const result = await addressService.deleteAddress(userId, addressId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Delete address controller error:', error);

    if (error.message === 'Address not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    next(error);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
