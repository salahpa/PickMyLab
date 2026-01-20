const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Protected routes
router.post('/initiate', authenticate, paymentController.initiatePayment);
router.post('/confirm', authenticate, paymentController.confirmPayment);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/:id', authenticate, paymentController.getPaymentById);

// Webhook route (no authentication - uses signature verification)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
