const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

// Public routes
router.get('/', ratingController.getRatings);
router.get('/summary', ratingController.getRatingSummary);

// Protected routes
router.post('/', authenticate, ratingController.submitRating);
router.put('/:id', authenticate, ratingController.updateRating);
router.delete('/:id', authenticate, ratingController.deleteRating);

module.exports = router;
