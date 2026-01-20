const phlebotomistService = require('../services/phlebotomistService');
const logger = require('../utils/logger');

/**
 * Get all phlebotomists
 */
const getPhlebotomists = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      availability: req.query.availability,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await phlebotomistService.getPhlebotomists(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get phlebotomists controller error:', error);
    next(error);
  }
};

/**
 * Get phlebotomist by ID
 */
const getPhlebotomistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const phlebotomist = await phlebotomistService.getPhlebotomistById(id);

    res.json({
      success: true,
      data: phlebotomist,
    });
  } catch (error) {
    logger.error('Get phlebotomist by ID controller error:', error);

    if (error.message === 'Phlebotomist not found') {
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
 * Assign phlebotomist to booking
 */
const assignPhlebotomist = async (req, res, next) => {
  try {
    const { booking_id, phlebotomist_id } = req.body;
    const assignedBy = req.user.id;

    if (!booking_id || !phlebotomist_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID and phlebotomist ID are required',
        },
      });
    }

    const result = await phlebotomistService.assignPhlebotomist(
      booking_id,
      phlebotomist_id,
      assignedBy
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Assign phlebotomist controller error:', error);

    if (
      error.message === 'Booking not found' ||
      error.message === 'Phlebotomist not found' ||
      error.message === 'Booking cannot be assigned in current status' ||
      error.message === 'Phlebotomist is not available' ||
      error.message === 'Phlebotomist has reached daily booking limit'
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
 * Auto-assign phlebotomist
 */
const autoAssignPhlebotomist = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    const assignedBy = req.user.id;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID is required',
        },
      });
    }

    const result = await phlebotomistService.autoAssignPhlebotomist(
      booking_id,
      assignedBy
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Auto-assign phlebotomist controller error:', error);
    next(error);
  }
};

/**
 * Update phlebotomist status
 */
const updatePhlebotomistStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required',
        },
      });
    }

    const result = await phlebotomistService.updatePhlebotomistStatus(
      id,
      status,
      location
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Update phlebotomist status controller error:', error);
    next(error);
  }
};

/**
 * Get phlebotomist bookings
 */
const getPhlebotomistBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filters = {
      status: req.query.status,
      date: req.query.date,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await phlebotomistService.getPhlebotomistBookings(id, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get phlebotomist bookings controller error:', error);
    next(error);
  }
};

/**
 * Update booking status (by phlebotomist)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { booking_id } = req.params;
    const { status, notes } = req.body;
    const phlebotomistId = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required',
        },
      });
    }

    const result = await phlebotomistService.updateBookingStatus(
      booking_id,
      phlebotomistId,
      status,
      notes
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Update booking status controller error:', error);
    next(error);
  }
};

/**
 * Get phlebotomist stock
 */
const getPhlebotomistStock = async (req, res, next) => {
  try {
    const { id } = req.params;

    const stock = await phlebotomistService.getPhlebotomistStock(id);

    res.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    logger.error('Get phlebotomist stock controller error:', error);
    next(error);
  }
};

/**
 * Update phlebotomist stock
 */
const updatePhlebotomistStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock_updates } = req.body;

    if (!stock_updates || !Array.isArray(stock_updates)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Stock updates array is required',
        },
      });
    }

    const result = await phlebotomistService.updatePhlebotomistStock(
      id,
      stock_updates
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Update phlebotomist stock controller error:', error);
    next(error);
  }
};

module.exports = {
  getPhlebotomists,
  getPhlebotomistById,
  assignPhlebotomist,
  autoAssignPhlebotomist,
  updatePhlebotomistStatus,
  getPhlebotomistBookings,
  updateBookingStatus,
  getPhlebotomistStock,
  updatePhlebotomistStock,
};
