const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const phlebotomistController = require('../controllers/phlebotomistController');

// Admin/Ops routes
router.get('/', authenticate, authorize('admin', 'ops'), phlebotomistController.getPhlebotomists);
router.get('/:id', authenticate, authorize('admin', 'ops'), phlebotomistController.getPhlebotomistById);
router.post('/assign', authenticate, authorize('admin', 'ops'), phlebotomistController.assignPhlebotomist);
router.post('/auto-assign', authenticate, authorize('admin', 'ops'), phlebotomistController.autoAssignPhlebotomist);
router.put('/:id/status', authenticate, authorize('admin', 'ops'), phlebotomistController.updatePhlebotomistStatus);

// Phlebotomist routes (for phlebotomist themselves)
router.get('/:id/bookings', authenticate, phlebotomistController.getPhlebotomistBookings);
router.put('/bookings/:booking_id/status', authenticate, phlebotomistController.updateBookingStatus);
router.get('/:id/stock', authenticate, phlebotomistController.getPhlebotomistStock);
router.put('/:id/stock', authenticate, phlebotomistController.updatePhlebotomistStock);

module.exports = router;
