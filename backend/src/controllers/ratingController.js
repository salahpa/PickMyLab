const ratingService = require('../services/ratingService');
const logger = require('../utils/logger');

/**
 * Submit rating
 */
const submitRating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { booking_id, rated_entity_type, rated_entity_id, rating, review_text } = req.body;

    if (!rated_entity_type || !rated_entity_id || !rating) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Entity type, entity ID, and rating are required',
        },
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rating must be between 1 and 5',
        },
      });
    }

    const result = await ratingService.submitRating(userId, {
      booking_id,
      rated_entity_type,
      rated_entity_id,
      rating,
      review_text,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Submit rating controller error:', error);

    if (
      error.message === 'Booking not found or does not belong to user' ||
      error.message === 'You have already rated this entity for this booking'
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
 * Get ratings
 */
const getRatings = async (req, res, next) => {
  try {
    const filters = {
      entity_type: req.query.entity_type,
      entity_id: req.query.entity_id,
      booking_id: req.query.booking_id,
      user_id: req.query.user_id,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await ratingService.getRatings(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get ratings controller error:', error);
    next(error);
  }
};

/**
 * Get rating summary
 */
const getRatingSummary = async (req, res, next) => {
  try {
    const { entity_type, entity_id } = req.query;

    if (!entity_type || !entity_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Entity type and entity ID are required',
        },
      });
    }

    const summary = await ratingService.getRatingSummary(entity_type, entity_id);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Get rating summary controller error:', error);
    next(error);
  }
};

/**
 * Update rating
 */
const updateRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, review_text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rating must be between 1 and 5',
        },
      });
    }

    const result = await ratingService.updateRating(id, userId, {
      rating,
      review_text,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Update rating controller error:', error);

    if (error.message === 'Rating not found or does not belong to user') {
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
 * Delete rating
 */
const deleteRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await ratingService.deleteRating(id, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Delete rating controller error:', error);

    if (error.message === 'Rating not found or does not belong to user') {
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
  submitRating,
  getRatings,
  getRatingSummary,
  updateRating,
  deleteRating,
};
