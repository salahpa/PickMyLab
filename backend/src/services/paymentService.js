const pool = require('../config/database');
const logger = require('../utils/logger');
const config = require('../config/env');

// For now, we'll create a mock payment service
// In production, integrate with Stripe, PayPal, or local payment gateway

/**
 * Initiate payment
 */
const initiatePayment = async (bookingId, userId, paymentMethod = 'card') => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get booking details
    const bookingResult = await client.query(
      `SELECT id, booking_number, final_amount, payment_status, booking_status
       FROM bookings
       WHERE id = $1 AND user_id = $2`,
      [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingResult.rows[0];

    if (booking.payment_status === 'completed') {
      throw new Error('Booking already paid');
    }

    if (booking.booking_status === 'cancelled') {
      throw new Error('Cannot pay for cancelled booking');
    }

    // Generate payment intent ID (mock - in production use Stripe/PayPal)
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update booking with payment intent
    await client.query(
      `UPDATE bookings 
       SET payment_method = $1,
           payment_transaction_id = $2,
           payment_status = 'pending',
           updated_at = NOW()
       WHERE id = $3`,
      [paymentMethod, paymentIntentId, bookingId]
    );

    await client.query('COMMIT');

    // In production, create payment intent with Stripe:
    // const stripe = require('stripe')(config.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(booking.final_amount * 100), // Convert to cents
    //   currency: 'aed',
    //   metadata: { booking_id: bookingId, user_id: userId }
    // });

    return {
      payment_intent_id: paymentIntentId,
      client_secret: `mock_secret_${paymentIntentId}`, // In production, use paymentIntent.client_secret
      amount: booking.final_amount,
      currency: 'AED',
      booking_id: bookingId,
      booking_number: booking.booking_number,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Initiate payment error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Confirm payment
 */
const confirmPayment = async (bookingId, userId, paymentIntentId, transactionId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify booking
    const bookingResult = await client.query(
      `SELECT id, final_amount, payment_status, payment_transaction_id
       FROM bookings
       WHERE id = $1 AND user_id = $2`,
      [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingResult.rows[0];

    if (booking.payment_status === 'completed') {
      throw new Error('Payment already confirmed');
    }

    // In production, verify payment with Stripe:
    // const stripe = require('stripe')(config.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    // if (paymentIntent.status !== 'succeeded') {
    //   throw new Error('Payment not successful');
    // }

    // Update booking payment status
    await client.query(
      `UPDATE bookings 
       SET payment_status = 'completed',
           payment_transaction_id = $1,
           booking_status = CASE 
             WHEN booking_status = 'pending' THEN 'confirmed'
             ELSE booking_status
           END,
           updated_at = NOW()
       WHERE id = $2`,
      [transactionId || paymentIntentId, bookingId]
    );

    // Create payment record
    await client.query(
      `INSERT INTO payments (
        booking_id, user_id, amount, payment_method, 
        transaction_id, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        bookingId,
        userId,
        booking.final_amount,
        'card', // Get from booking
        transactionId || paymentIntentId,
        'completed',
      ]
    );

    await client.query('COMMIT');

    return {
      success: true,
      message: 'Payment confirmed successfully',
      booking_id: bookingId,
      transaction_id: transactionId || paymentIntentId,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Confirm payment error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get payment history
 */
const getPaymentHistory = async (userId, filters = {}) => {
  try {
    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.id,
        p.booking_id,
        p.amount,
        p.payment_method,
        p.transaction_id,
        p.status,
        p.created_at,
        b.booking_number
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.user_id = $1
    `;

    const values = [userId];
    let paramCount = 2;

    if (filters.status) {
      query += ` AND p.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    query += ' ORDER BY p.created_at DESC';

    // Get total count - create separate count query
    let countQuery = `
      SELECT COUNT(*) as total
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.user_id = $1
    `;
    const countValues = [userId];
    let countParamCount = 2;

    if (filters.status) {
      countQuery += ` AND p.status = $${countParamCount}`;
      countValues.push(filters.status);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      payments: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Get payment history error:', error);
    throw error;
  }
};

/**
 * Get payment by ID
 */
const getPaymentById = async (paymentId, userId) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.*,
        b.booking_number,
        b.preferred_date,
        b.preferred_time_slot
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       WHERE p.id = $1 AND p.user_id = $2`,
      [paymentId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Payment not found');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get payment by ID error:', error);
    throw error;
  }
};

/**
 * Handle payment webhook (for Stripe/PayPal)
 */
const handlePaymentWebhook = async (event) => {
  try {
    // In production, verify webhook signature
    // const stripe = require('stripe')(config.STRIPE_SECRET_KEY);
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata.booking_id;

      // Update booking payment status
      await pool.query(
        `UPDATE bookings 
         SET payment_status = 'completed',
             payment_transaction_id = $1,
             booking_status = CASE 
               WHEN booking_status = 'pending' THEN 'confirmed'
               ELSE booking_status
             END,
             updated_at = NOW()
         WHERE id = $2`,
        [paymentIntent.id, bookingId]
      );

      logger.info(`Payment succeeded for booking ${bookingId}`);
    }

    return { received: true };
  } catch (error) {
    logger.error('Payment webhook error:', error);
    throw error;
  }
};

module.exports = {
  initiatePayment,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
  handlePaymentWebhook,
};
