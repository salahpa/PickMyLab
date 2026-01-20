const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin', 'ops'));

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Bookings
router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);

// Users
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// Content Management
router.get('/faqs', adminController.getFAQs);
router.post('/faqs', adminController.createFAQ);
router.put('/faqs/:id', adminController.updateFAQ);
router.delete('/faqs/:id', adminController.deleteFAQ);

router.get('/terms', adminController.getTerms);
router.put('/terms', adminController.updateTerms);

module.exports = router;
