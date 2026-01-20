const pool = require('../config/database');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique booking number
 */
const generateBookingNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TAS-${year}${month}-${random}`;
};

/**
 * Calculate booking total
 */
const calculateBookingTotal = async (testIds, labPartnerId, bundleIds = []) => {
  let total = 0;
  const testPrices = [];

  // Calculate test prices
  if (testIds && testIds.length > 0) {
    const testQuery = `
      SELECT ltp.price, ltp.test_id
      FROM lab_test_pricing ltp
      WHERE ltp.test_id = ANY($1::uuid[])
        AND ltp.lab_partner_id = $2
        AND ltp.is_available = TRUE
    `;
    const testResult = await pool.query(testQuery, [testIds, labPartnerId]);
    
    for (const row of testResult.rows) {
      const price = parseFloat(row.price);
      total += price;
      testPrices.push({ test_id: row.test_id, price });
    }
  }

  // Calculate bundle prices
  if (bundleIds && bundleIds.length > 0) {
    for (const bundleId of bundleIds) {
      const bundleResult = await pool.query(
        `SELECT discount_percentage FROM test_bundles WHERE id = $1`,
        [bundleId]
      );

      if (bundleResult.rows.length > 0) {
        const discount = parseFloat(bundleResult.rows[0].discount_percentage) || 0;
        
        // Get bundle tests
        const bundleTestsResult = await pool.query(
          `SELECT test_id FROM bundle_tests WHERE bundle_id = $1`,
          [bundleId]
        );

        let bundleTotal = 0;
        for (const bt of bundleTestsResult.rows) {
          const priceResult = await pool.query(
            `SELECT price FROM lab_test_pricing 
             WHERE test_id = $1 AND lab_partner_id = $2 AND is_available = TRUE`,
            [bt.test_id, labPartnerId]
          );
          if (priceResult.rows.length > 0) {
            bundleTotal += parseFloat(priceResult.rows[0].price);
          }
        }

        const discountedPrice = bundleTotal * (1 - discount / 100);
        total += discountedPrice;
      }
    }
  }

  return { total, testPrices };
};

/**
 * Create new booking
 */
const createBooking = async (userId, bookingData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validate required fields
    if (!bookingData.tests || bookingData.tests.length === 0) {
      throw new Error('At least one test is required');
    }

    if (!bookingData.lab_partner_id) {
      throw new Error('Lab partner is required');
    }

    if (!bookingData.preferred_date) {
      throw new Error('Preferred date is required');
    }

    // Calculate total
    const testIds = bookingData.tests.map((t) => t.test_id);
    const bundleIds = bookingData.bundles || [];
    const { total, testPrices } = await calculateBookingTotal(
      testIds,
      bookingData.lab_partner_id,
      bundleIds
    );

    const discountAmount = bookingData.discount_amount || 0;
    const finalAmount = total - discountAmount;

    // Generate booking number
    let bookingNumber = generateBookingNumber();
    let exists = true;
    while (exists) {
      const check = await client.query(
        'SELECT id FROM bookings WHERE booking_number = $1',
        [bookingNumber]
      );
      exists = check.rows.length > 0;
      if (exists) {
        bookingNumber = generateBookingNumber();
      }
    }

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (
        booking_number, user_id, collection_address_id, collection_type,
        preferred_date, preferred_time_slot, special_requirements,
        total_amount, discount_amount, final_amount, payment_status,
        booking_status, lab_partner_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        bookingNumber,
        userId,
        bookingData.collection_address_id || null,
        bookingData.collection_type || 'home',
        bookingData.preferred_date,
        bookingData.preferred_time_slot || null,
        bookingData.special_requirements || null,
        total,
        discountAmount,
        finalAmount,
        'pending',
        'pending',
        bookingData.lab_partner_id,
      ]
    );

    const booking = bookingResult.rows[0];

    // Add booking tests
    for (const testPrice of testPrices) {
      await client.query(
        `INSERT INTO booking_tests (booking_id, test_id, lab_partner_id, price)
         VALUES ($1, $2, $3, $4)`,
        [booking.id, testPrice.test_id, bookingData.lab_partner_id, testPrice.price]
      );
    }

    // Add booking bundles
    if (bundleIds.length > 0) {
      for (const bundleId of bundleIds) {
        await client.query(
          `INSERT INTO booking_bundles (booking_id, bundle_id)
           VALUES ($1, $2)`,
          [booking.id, bundleId]
        );
      }
    }

    await client.query('COMMIT');

    // Fetch full booking details
    const fullBooking = await getBookingById(booking.id, userId);

    return fullBooking;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create booking error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get booking by ID
 */
const getBookingById = async (bookingId, userId = null) => {
  try {
    let query = `
      SELECT 
        b.*,
        u.first_name || ' ' || u.last_name as customer_name,
        u.phone as customer_phone,
        u.email as customer_email,
        lp.name as lab_partner_name,
        ua.address_line1, ua.address_line2, ua.city, ua.state, ua.postal_code
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN lab_partners lp ON b.lab_partner_id = lp.id
      LEFT JOIN user_addresses ua ON b.collection_address_id = ua.id
      WHERE b.id = $1
    `;

    const values = [bookingId];

    if (userId) {
      query += ' AND b.user_id = $2';
      values.push(userId);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = result.rows[0];

    // Get booking tests
    const testsResult = await pool.query(
      `SELECT 
        bt.test_id, bt.price,
        t.name as test_name, t.code as test_code, t.sample_type
       FROM booking_tests bt
       JOIN tests t ON bt.test_id = t.id
       WHERE bt.booking_id = $1`,
      [bookingId]
    );
    booking.tests = testsResult.rows;

    // Get booking bundles
    const bundlesResult = await pool.query(
      `SELECT 
        bb.bundle_id,
        tb.name as bundle_name, tb.discount_percentage
       FROM booking_bundles bb
       JOIN test_bundles tb ON bb.bundle_id = tb.id
       WHERE bb.booking_id = $1`,
      [bookingId]
    );
    booking.bundles = bundlesResult.rows;

    // Get phlebotomist info if assigned
    if (booking.phlebotomist_id) {
      const phlebResult = await pool.query(
        `SELECT 
          u.first_name || ' ' || u.last_name as name,
          u.phone
         FROM users u
         WHERE u.id = $1`,
        [booking.phlebotomist_id]
      );
      booking.phlebotomist = phlebResult.rows[0] || null;
    }

    // Build timeline
    booking.timeline = [];
    if (booking.created_at) {
      booking.timeline.push({
        event: 'booking_created',
        timestamp: booking.created_at,
        message: 'Booking created',
      });
    }
    if (booking.assigned_at) {
      booking.timeline.push({
        event: 'phlebotomist_assigned',
        timestamp: booking.assigned_at,
        message: 'Phlebotomist assigned',
      });
    }
    if (booking.sample_collected_at) {
      booking.timeline.push({
        event: 'sample_collected',
        timestamp: booking.sample_collected_at,
        message: 'Sample collected',
      });
    }
    if (booking.sample_delivered_at) {
      booking.timeline.push({
        event: 'sample_delivered',
        timestamp: booking.sample_delivered_at,
        message: 'Sample delivered to lab',
      });
    }
    if (booking.report_ready_at) {
      booking.timeline.push({
        event: 'report_ready',
        timestamp: booking.report_ready_at,
        message: 'Report ready',
      });
    }

    return booking;
  } catch (error) {
    logger.error('Get booking by ID error:', error);
    throw error;
  }
};

/**
 * Get user bookings
 */
const getUserBookings = async (userId, filters = {}) => {
  try {
    const { status, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.id, b.booking_number, b.booking_status, b.payment_status,
        b.total_amount, b.final_amount, b.preferred_date, b.preferred_time_slot,
        b.created_at, b.lab_partner_id,
        lp.name as lab_partner_name
      FROM bookings b
      LEFT JOIN lab_partners lp ON b.lab_partner_id = lp.id
      WHERE b.user_id = $1
    `;

    const values = [userId];
    let paramCount = 2;

    if (status) {
      query += ` AND b.booking_status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ' ORDER BY b.created_at DESC';

    // Get total count
    const countQuery = query.replace(
      'SELECT \n        b.id,',
      'SELECT COUNT(*) as total'
    );
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Get user bookings error:', error);
    throw error;
  }
};

/**
 * Update booking status
 */
const updateBookingStatus = async (bookingId, status, userId = null) => {
  try {
    let query = 'UPDATE bookings SET booking_status = $1, updated_at = NOW() WHERE id = $2';
    const values = [status, bookingId];

    if (userId) {
      query += ' AND user_id = $3';
      values.push(userId);
    }

    query += ' RETURNING *';

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Update booking status error:', error);
    throw error;
  }
};

/**
 * Cancel booking
 */
const cancelBooking = async (bookingId, userId, reason) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify booking belongs to user
    const bookingCheck = await client.query(
      'SELECT booking_status FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (bookingCheck.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const currentStatus = bookingCheck.rows[0].booking_status;

    // Only allow cancellation if booking is pending or confirmed
    if (!['pending', 'confirmed'].includes(currentStatus)) {
      throw new Error('Booking cannot be cancelled at this stage');
    }

    // Update booking
    const result = await client.query(
      `UPDATE bookings 
       SET booking_status = 'cancelled',
           cancellation_reason = $1,
           cancelled_at = NOW(),
           updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [reason, bookingId, userId]
    );

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Cancel booking error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get booking tracking info
 */
const getBookingTracking = async (bookingId, userId = null) => {
  try {
    const booking = await getBookingById(bookingId, userId);

    const tracking = {
      current_status: booking.booking_status,
      booking_number: booking.booking_number,
      timeline: booking.timeline,
    };

    // Add phlebotomist info if assigned
    if (booking.phlebotomist_id) {
      tracking.phlebotomist = booking.phlebotomist;
      // In a real app, you'd get real-time location from phlebotomist app
      tracking.phlebotomist.location = {
        latitude: null, // Would come from phlebotomist app
        longitude: null,
        last_updated: null,
      };
      tracking.phlebotomist.eta_minutes = null; // Would be calculated
    }

    return tracking;
  } catch (error) {
    logger.error('Get booking tracking error:', error);
    throw error;
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingTracking,
  calculateBookingTotal,
};
