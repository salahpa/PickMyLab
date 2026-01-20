const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

/**
 * Initiate payment
 */
const initiatePayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { booking_id, payment_method = 'card' } = req.body;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID is required',
        },
      });
    }

    const paymentIntent = await paymentService.initiatePayment(
      booking_id,
      userId,
      payment_method
    );

    res.json({
      success: true,
      data: paymentIntent,
    });
  } catch (error) {
    logger.error('Initiate payment controller error:', error);

    if (
      error.message === 'Booking not found' ||
      error.message === 'Booking already paid' ||
      error.message === 'Cannot pay for cancelled booking'
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
 * Confirm payment
 */
const confirmPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { booking_id, payment_intent_id, transaction_id } = req.body;

    if (!booking_id || !payment_intent_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID and payment intent ID are required',
        },
      });
    }

    const result = await paymentService.confirmPayment(
      booking_id,
      userId,
      payment_intent_id,
      transaction_id
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Confirm payment controller error:', error);

    if (
      error.message === 'Booking not found' ||
      error.message === 'Payment already confirmed'
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
 * Get payment history
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      status: req.query.status,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await paymentService.getPaymentHistory(userId, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get payment history controller error:', error);
    next(error);
  }
};

/**
 * Get payment by ID
 */
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await paymentService.getPaymentById(id, userId);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Get payment by ID controller error:', error);

    if (error.message === 'Payment not found') {
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
 * Handle payment webhook
 */
const handleWebhook = async (req, res, next) => {
  try {
    // In production, verify webhook signature here
    const event = req.body;

    await paymentService.handlePaymentWebhook(event);

    res.json({ received: true });
  } catch (error) {
    logger.error('Payment webhook error:', error);
    next(error);
  }
};

module.exports = {
  initiatePayment,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
  handleWebhook,
};
