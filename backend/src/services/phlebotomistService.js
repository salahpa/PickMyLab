const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get all phlebotomists
 */
const getPhlebotomists = async (filters = {}) => {
  try {
    const { status, availability, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.is_active,
        COALESCE(p.license_number, '') as license_number,
        COALESCE(p.vehicle_type, '') as vehicle_type,
        p.current_location_lat,
        p.current_location_lng,
        COALESCE(p.availability_status, 'offline') as availability_status,
        COALESCE(p.max_bookings_per_day, 10) as max_bookings_per_day,
        COALESCE(p.current_bookings_count, 0) as current_bookings_count,
        p.created_at
      FROM users u
      LEFT JOIN phlebotomists p ON u.id = p.user_id
      WHERE u.user_type = 'phlebotomist'
    `;

    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` AND p.availability_status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (availability === 'available') {
      query += ` AND p.availability_status = 'available' AND p.current_bookings_count < p.max_bookings_per_day`;
    }

    // Get total count (before ORDER BY and pagination)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN phlebotomists p ON u.id = p.user_id
      WHERE u.user_type = 'phlebotomist'
    `;
    const countValues = [];
    let countParamCount = 1;
    
    if (status) {
      countQuery += ` AND p.availability_status = $${countParamCount}`;
      countValues.push(status);
      countParamCount++;
    }
    
    if (availability === 'available') {
      countQuery += ` AND p.availability_status = 'available' AND p.current_bookings_count < p.max_bookings_per_day`;
    }
    
    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total);
    
    // Add ORDER BY and pagination to main query
    query += ' ORDER BY u.first_name, u.last_name';
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      phlebotomists: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Get phlebotomists error:', error);
    throw error;
  }
};

/**
 * Get phlebotomist by ID
 */
const getPhlebotomistById = async (phlebotomistId) => {
  try {
    const result = await pool.query(
      `SELECT 
        u.*,
        p.*
       FROM users u
       JOIN phlebotomists p ON u.id = p.user_id
       WHERE u.id = $1 AND u.user_type = 'phlebotomist'`,
      [phlebotomistId]
    );

    if (result.rows.length === 0) {
      throw new Error('Phlebotomist not found');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get phlebotomist by ID error:', error);
    throw error;
  }
};

/**
 * Assign phlebotomist to booking
 */
const assignPhlebotomist = async (bookingId, phlebotomistId, assignedBy) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check booking exists and is assignable
    const bookingCheck = await client.query(
      `SELECT id, booking_status, collection_type, preferred_date, preferred_time_slot
       FROM bookings
       WHERE id = $1`,
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingCheck.rows[0];

    if (!['pending', 'confirmed'].includes(booking.booking_status)) {
      throw new Error('Booking cannot be assigned in current status');
    }

    // Check phlebotomist availability
    const phlebCheck = await client.query(
      `SELECT 
        COALESCE(p.availability_status, 'offline') as availability_status,
        COALESCE(p.current_bookings_count, 0) as current_bookings_count,
        COALESCE(p.max_bookings_per_day, 10) as max_bookings_per_day
       FROM phlebotomists p
       WHERE p.user_id = $1`,
      [phlebotomistId]
    );

    // If phlebotomist record doesn't exist, create it
    if (phlebCheck.rows.length === 0) {
      await client.query(
        `INSERT INTO phlebotomists (user_id, availability_status, max_bookings_per_day, current_bookings_count)
         VALUES ($1, 'available', 10, 0)`,
        [phlebotomistId]
      );
      const newCheck = await client.query(
        `SELECT 
          COALESCE(p.availability_status, 'offline') as availability_status,
          COALESCE(p.current_bookings_count, 0) as current_bookings_count,
          COALESCE(p.max_bookings_per_day, 10) as max_bookings_per_day
         FROM phlebotomists p
         WHERE p.user_id = $1`,
        [phlebotomistId]
      );
      const phleb = newCheck.rows[0];
      
      if (phleb.availability_status !== 'available') {
        throw new Error('Phlebotomist is not available');
      }
    } else {
      const phleb = phlebCheck.rows[0];

      if (phleb.availability_status !== 'available') {
        throw new Error('Phlebotomist is not available');
      }

      if (phleb.current_bookings_count >= phleb.max_bookings_per_day) {
        throw new Error('Phlebotomist has reached daily booking limit');
      }
    }

    // Assign phlebotomist
    await client.query(
      `UPDATE bookings 
       SET phlebotomist_id = $1,
           booking_status = 'confirmed',
           assigned_at = NOW(),
           assigned_by = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [phlebotomistId, assignedBy, bookingId]
    );

    // Update phlebotomist booking count (create record if doesn't exist)
    await client.query(
      `INSERT INTO phlebotomists (user_id, current_bookings_count, availability_status, max_bookings_per_day)
       VALUES ($1, 1, 'available', 10)
       ON CONFLICT (user_id)
       DO UPDATE SET current_bookings_count = phlebotomists.current_bookings_count + 1, updated_at = NOW()`,
      [phlebotomistId]
    );

    // Create assignment log
    await client.query(
      `INSERT INTO phlebotomist_assignments (
        booking_id, phlebotomist_id, assigned_by, status, created_at
      ) VALUES ($1, $2, $3, 'assigned', NOW())`,
      [bookingId, phlebotomistId, assignedBy]
    );

    await client.query('COMMIT');

    return {
      success: true,
      message: 'Phlebotomist assigned successfully',
      booking_id: bookingId,
      phlebotomist_id: phlebotomistId,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Assign phlebotomist error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Auto-assign phlebotomist to booking
 */
const autoAssignPhlebotomist = async (bookingId, assignedBy) => {
  try {
    // Get booking details
    const bookingResult = await pool.query(
      `SELECT 
        id, collection_type, preferred_date, preferred_time_slot,
        collection_address_id
       FROM bookings
       WHERE id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingResult.rows[0];

    // Find available phlebotomists
    const availablePhlebs = await pool.query(
      `SELECT 
        u.id as user_id,
        p.current_location_lat,
        p.current_location_lng,
        COALESCE(p.current_bookings_count, 0) as current_bookings_count,
        COALESCE(p.max_bookings_per_day, 10) as max_bookings_per_day,
        u.first_name,
        u.last_name
       FROM users u
       LEFT JOIN phlebotomists p ON u.id = p.user_id
       WHERE u.user_type = 'phlebotomist'
         AND u.is_active = true
         AND (p.availability_status = 'available' OR p.availability_status IS NULL)
         AND (COALESCE(p.current_bookings_count, 0) < COALESCE(p.max_bookings_per_day, 10))
       ORDER BY COALESCE(p.current_bookings_count, 0) ASC
       LIMIT 5`,
      []
    );

    if (availablePhlebs.rows.length === 0) {
      throw new Error('No available phlebotomists');
    }

    // For now, assign the first available (can enhance with location-based logic)
    const selectedPhleb = availablePhlebs.rows[0];

    return await assignPhlebotomist(bookingId, selectedPhleb.user_id, assignedBy);
  } catch (error) {
    logger.error('Auto-assign phlebotomist error:', error);
    throw error;
  }
};

/**
 * Update phlebotomist status
 */
const updatePhlebotomistStatus = async (phlebotomistId, status, location = null) => {
  try {
    let query = `
      UPDATE phlebotomists 
      SET availability_status = $1,
          updated_at = NOW()
    `;

    const values = [status];
    let paramCount = 2;

    if (location && location.lat && location.lng) {
      query += `, current_location_lat = $${paramCount}, current_location_lng = $${paramCount + 1}`;
      values.push(location.lat, location.lng);
      paramCount += 2;
    }

    query += ` WHERE user_id = $${paramCount}`;
    values.push(phlebotomistId);

    await pool.query(query, values);

    return {
      success: true,
      message: 'Phlebotomist status updated',
    };
  } catch (error) {
    logger.error('Update phlebotomist status error:', error);
    throw error;
  }
};

/**
 * Update booking status (by phlebotomist)
 */
const updateBookingStatus = async (bookingId, phlebotomistId, status, notes = null) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify phlebotomist is assigned to this booking
    const bookingCheck = await client.query(
      'SELECT id, phlebotomist_id, booking_status FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingCheck.rows[0];

    if (booking.phlebotomist_id !== phlebotomistId) {
      throw new Error('Phlebotomist not assigned to this booking');
    }

    // Update booking status
    await client.query(
      `UPDATE bookings 
       SET booking_status = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [status, bookingId]
    );

    // Log status update
    await client.query(
      `INSERT INTO booking_status_logs (
        booking_id, status, updated_by, notes, created_at
      ) VALUES ($1, $2, $3, $4, NOW())`,
      [bookingId, status, phlebotomistId, notes]
    );

    // If completed, update phlebotomist booking count
    if (status === 'sample_collected' || status === 'completed') {
      await client.query(
        `UPDATE phlebotomists 
         SET current_bookings_count = GREATEST(0, current_bookings_count - 1),
             updated_at = NOW()
         WHERE user_id = $1`,
        [phlebotomistId]
      );
    }

    await client.query('COMMIT');

    return {
      success: true,
      message: 'Booking status updated',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update booking status error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get phlebotomist bookings
 */
const getPhlebotomistBookings = async (phlebotomistId, filters = {}) => {
  try {
    const { status, date, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.*,
        u.first_name || ' ' || u.last_name as patient_name,
        u.phone as patient_phone,
        ua.address_line1,
        ua.address_line2,
        ua.city,
        ua.state,
        ua.postal_code,
        ua.latitude,
        ua.longitude
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN user_addresses ua ON b.collection_address_id = ua.id
      WHERE b.phlebotomist_id = $1
    `;

    const values = [phlebotomistId];
    let paramCount = 2;

    if (status) {
      query += ` AND b.booking_status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (date) {
      query += ` AND b.preferred_date = $${paramCount}`;
      values.push(date);
      paramCount++;
    }

    query += ' ORDER BY b.preferred_date DESC, b.preferred_time_slot';

    // Get total count
    const countQuery = query.replace('SELECT \n        b.*,', 'SELECT COUNT(*) as total');
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
    logger.error('Get phlebotomist bookings error:', error);
    throw error;
  }
};

/**
 * Get stock for phlebotomist
 */
const getPhlebotomistStock = async (phlebotomistId) => {
  try {
    const result = await pool.query(
      `SELECT 
        ps.*,
        ps.item_name,
        ps.item_type,
        ps.unit
       FROM phlebotomist_stock ps
       WHERE ps.phlebotomist_id = $1
       ORDER BY ps.item_name`,
      [phlebotomistId]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get phlebotomist stock error:', error);
    throw error;
  }
};

/**
 * Update phlebotomist stock
 */
const updatePhlebotomistStock = async (phlebotomistId, stockUpdates) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const update of stockUpdates) {

      const { item_name, item_type, quantity, action } = update;

      if (action === 'add') {
        await client.query(
          `INSERT INTO phlebotomist_stock (
            phlebotomist_id, item_name, item_type, quantity, updated_at
          ) VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (phlebotomist_id, item_name)
          DO UPDATE SET quantity = phlebotomist_stock.quantity + $4, updated_at = NOW()`,
          [phlebotomistId, item_name, item_type, quantity]
        );
      } else if (action === 'subtract') {
        await client.query(
          `UPDATE phlebotomist_stock 
           SET quantity = GREATEST(0, quantity - $1),
               updated_at = NOW()
           WHERE phlebotomist_id = $2 AND item_name = $3`,
          [quantity, phlebotomistId, item_name]
        );
      } else if (action === 'set') {
        await client.query(
          `INSERT INTO phlebotomist_stock (
            phlebotomist_id, item_name, item_type, quantity, updated_at
          ) VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (phlebotomist_id, item_name)
          DO UPDATE SET quantity = $4, updated_at = NOW()`,
          [phlebotomistId, item_name, item_type, quantity]
        );
      }
    }

    await client.query('COMMIT');

    return {
      success: true,
      message: 'Stock updated successfully',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update phlebotomist stock error:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getPhlebotomists,
  getPhlebotomistById,
  assignPhlebotomist,
  autoAssignPhlebotomist,
  updatePhlebotomistStatus,
  updateBookingStatus,
  getPhlebotomistBookings,
  getPhlebotomistStock,
  updatePhlebotomistStock,
};
