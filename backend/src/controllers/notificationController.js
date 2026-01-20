const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * Get user notifications
 */
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      type: req.query.type,
      status: req.query.status,
    };

    const result = await notificationService.getUserNotifications(userId, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get user notifications controller error:', error);
    next(error);
  }
};

/**
 * Get notification preferences
 */
const getNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const preferences = await notificationService.getNotificationPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    logger.error('Get notification preferences controller error:', error);
    next(error);
  }
};

/**
 * Update notification preferences
 */
const updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    const updated = await notificationService.updateNotificationPreferences(
      userId,
      preferences
    );

    res.json({
      success: true,
      data: updated,
      message: 'Notification preferences updated successfully',
    });
  } catch (error) {
    logger.error('Update notification preferences controller error:', error);
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
};
