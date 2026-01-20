const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All routes require authentication
router.get('/', authenticate, notificationController.getUserNotifications);
router.get('/preferences', authenticate, notificationController.getNotificationPreferences);
router.put('/preferences', authenticate, notificationController.updateNotificationPreferences);

module.exports = router;
