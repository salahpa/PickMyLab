const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const addressRoutes = require('./addressRoutes');
const testRoutes = require('./testRoutes');
const labRoutes = require('./labRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const reportRoutes = require('./reportRoutes');
const notificationRoutes = require('./notificationRoutes');
const phlebotomistRoutes = require('./phlebotomistRoutes');
const adminRoutes = require('./adminRoutes');
const ratingRoutes = require('./ratingRoutes');

// API version info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PickMyLab Healthcare Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      addresses: '/api/addresses',
      tests: '/api/tests',
      labs: '/api/labs',
      bookings: '/api/bookings',
      payments: '/api/payments',
      reports: '/api/reports',
      notifications: '/api/notifications',
      phlebotomists: '/api/phlebotomists',
      admin: '/api/admin',
      ratings: '/api/ratings',
    },
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/addresses', addressRoutes);
router.use('/tests', testRoutes);
router.use('/labs', labRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/phlebotomists', phlebotomistRoutes);
router.use('/admin', adminRoutes);
router.use('/ratings', ratingRoutes);

module.exports = router;
