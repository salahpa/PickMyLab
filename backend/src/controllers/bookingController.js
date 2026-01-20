const bookingService = require('../services/bookingService');
const logger = require('../utils/logger');

/**
 * Create new booking
 */
const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookingData = req.body;

    const booking = await bookingService.createBooking(userId, bookingData);

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully',
    });
  } catch (error) {
    logger.error('Create booking controller error:', error);

    if (
      error.message === 'At least one test is required' ||
      error.message === 'Lab partner is required' ||
      error.message === 'Preferred date is required'
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    next(error);
  }
};

/**
 * Get user bookings
 */
const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      status: req.query.status,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await bookingService.getUserBookings(userId, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get user bookings controller error:', error);
    next(error);
  }
};

/**
 * Get booking by ID
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await bookingService.getBookingById(id, userId);

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    logger.error('Get booking by ID controller error:', error);

    if (error.message === 'Booking not found') {
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
 * Cancel booking
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cancellation reason is required',
        },
      });
    }

    const booking = await bookingService.cancelBooking(id, userId, reason);

    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    logger.error('Cancel booking controller error:', error);

    if (
      error.message === 'Booking not found' ||
      error.message === 'Booking cannot be cancelled at this stage'
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    next(error);
  }
};

/**
 * Get booking tracking
 */
const getBookingTracking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const tracking = await bookingService.getBookingTracking(id, userId);

    res.json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    logger.error('Get booking tracking controller error:', error);
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getBookingTracking,
};
