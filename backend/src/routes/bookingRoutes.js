const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// All booking routes require authentication
router.use(authenticate);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);
router.get('/:id/tracking', bookingController.getBookingTracking);
router.put('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
