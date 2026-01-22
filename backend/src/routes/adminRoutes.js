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

// Test Categories Management
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Tests Management
router.get('/tests', adminController.getAllTestsAdmin);
router.post('/tests', adminController.createTest);
router.put('/tests/:id', adminController.updateTest);
router.delete('/tests/:id', adminController.deleteTest);

// Lab Partners Management
router.get('/lab-partners', adminController.getAllLabPartners);
router.post('/lab-partners', adminController.createLabPartner);
router.put('/lab-partners/:id', adminController.updateLabPartner);
router.delete('/lab-partners/:id', adminController.deleteLabPartner);

// Test Pricing Management
router.get('/lab-partners/:lab_partner_id/pricing', adminController.getTestPricing);
router.post('/pricing', adminController.upsertTestPricing);
router.put('/pricing/:id', adminController.upsertTestPricing);
router.delete('/pricing/:id', adminController.deleteTestPricing);

module.exports = router;
