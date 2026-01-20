const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Submit rating
 */
const submitRating = async (userId, ratingData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { booking_id, rated_entity_type, rated_entity_id, rating, review_text } = ratingData;

    // Verify booking belongs to user
    if (booking_id) {
      const bookingCheck = await client.query(
        'SELECT id FROM bookings WHERE id = $1 AND user_id = $2',
        [booking_id, userId]
      );

      if (bookingCheck.rows.length === 0) {
        throw new Error('Booking not found or does not belong to user');
      }
    }

    // Check if user already rated this entity for this booking
    if (booking_id) {
      const existingCheck = await client.query(
        `SELECT id FROM ratings 
         WHERE booking_id = $1 
           AND user_id = $2 
           AND rated_entity_type = $3 
           AND rated_entity_id = $4`,
        [booking_id, userId, rated_entity_type, rated_entity_id]
      );

      if (existingCheck.rows.length > 0) {
        throw new Error('You have already rated this entity for this booking');
      }
    }

    // Create rating
    const result = await client.query(
      `INSERT INTO ratings (
        booking_id, user_id, rated_entity_type, rated_entity_id,
        rating, review_text, is_verified, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        booking_id || null,
        userId,
        rated_entity_type,
        rated_entity_id,
        rating,
        review_text || null,
        booking_id ? true : false, // Verified if linked to booking
      ]
    );

    // Update aggregated rating for the entity
    await updateEntityRating(rated_entity_type, rated_entity_id);

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Submit rating error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update entity rating (aggregate)
 */
const updateEntityRating = async (entityType, entityId) => {
  try {
    // Calculate average rating
    const avgResult = await pool.query(
      `SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_ratings
       FROM ratings
       WHERE rated_entity_type = $1 AND rated_entity_id = $2`,
      [entityType, entityId]
    );

    const avgRating = parseFloat(avgResult.rows[0].avg_rating) || 0;
    const totalRatings = parseInt(avgResult.rows[0].total_ratings) || 0;

    // Update rating in appropriate table
    if (entityType === 'lab_partner') {
      await pool.query(
        `UPDATE lab_partners 
         SET rating = $1,
             total_ratings = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [avgRating, totalRatings, entityId]
      );
    } else if (entityType === 'phlebotomist') {
      // Update phlebotomist profile if exists
      const profileCheck = await pool.query(
        'SELECT id FROM phlebotomist_profiles WHERE user_id = $1',
        [entityId]
      );
      if (profileCheck.rows.length > 0) {
        await pool.query(
          `UPDATE phlebotomist_profiles 
           SET rating = $1,
               total_bookings = $2,
               updated_at = NOW()
           WHERE user_id = $3`,
          [avgRating, totalRatings, entityId]
        );
      }
    }

    return { avg_rating: avgRating, total_ratings: totalRatings };
  } catch (error) {
    logger.error('Update entity rating error:', error);
    throw error;
  }
};

/**
 * Get ratings
 */
const getRatings = async (filters = {}) => {
  try {
    const { entity_type, entity_id, booking_id, user_id, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        r.*,
        u.first_name || ' ' || u.last_name as reviewer_name,
        u.email as reviewer_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (entity_type) {
      query += ` AND r.rated_entity_type = $${paramCount}`;
      values.push(entity_type);
      paramCount++;
    }

    if (entity_id) {
      query += ` AND r.rated_entity_id = $${paramCount}`;
      values.push(entity_id);
      paramCount++;
    }

    if (booking_id) {
      query += ` AND r.booking_id = $${paramCount}`;
      values.push(booking_id);
      paramCount++;
    }

    if (user_id) {
      query += ` AND r.user_id = $${paramCount}`;
      values.push(user_id);
      paramCount++;
    }

    query += ' ORDER BY r.created_at DESC';

    // Get total count
    const countQuery = query.replace('SELECT \n        r.*,', 'SELECT COUNT(*) as total');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      ratings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Get ratings error:', error);
    throw error;
  }
};

/**
 * Get rating summary for entity
 */
const getRatingSummary = async (entityType, entityId) => {
  try {
    const result = await pool.query(
      `SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_ratings,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star
       FROM ratings
       WHERE rated_entity_type = $1 AND rated_entity_id = $2`,
      [entityType, entityId]
    );

    if (result.rows.length === 0 || !result.rows[0].total_ratings) {
      return {
        avg_rating: 0,
        total_ratings: 0,
        distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const row = result.rows[0];

    return {
      avg_rating: parseFloat(row.avg_rating).toFixed(1),
      total_ratings: parseInt(row.total_ratings),
      distribution: {
        5: parseInt(row.five_star) || 0,
        4: parseInt(row.four_star) || 0,
        3: parseInt(row.three_star) || 0,
        2: parseInt(row.two_star) || 0,
        1: parseInt(row.one_star) || 0,
      },
    };
  } catch (error) {
    logger.error('Get rating summary error:', error);
    throw error;
  }
};

/**
 * Update rating
 */
const updateRating = async (ratingId, userId, ratingData) => {
  try {
    // Verify rating belongs to user
    const ratingCheck = await pool.query(
      'SELECT id, rated_entity_type, rated_entity_id FROM ratings WHERE id = $1 AND user_id = $2',
      [ratingId, userId]
    );

    if (ratingCheck.rows.length === 0) {
      throw new Error('Rating not found or does not belong to user');
    }

    const rating = ratingCheck.rows[0];

    // Update rating
    const result = await pool.query(
      `UPDATE ratings 
       SET rating = $1,
           review_text = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [ratingData.rating, ratingData.review_text || null, ratingId]
    );

    // Update aggregated rating
    await updateEntityRating(rating.rated_entity_type, rating.rated_entity_id);

    return result.rows[0];
  } catch (error) {
    logger.error('Update rating error:', error);
    throw error;
  }
};

/**
 * Delete rating
 */
const deleteRating = async (ratingId, userId) => {
  try {
    // Verify rating belongs to user
    const ratingCheck = await pool.query(
      'SELECT rated_entity_type, rated_entity_id FROM ratings WHERE id = $1 AND user_id = $2',
      [ratingId, userId]
    );

    if (ratingCheck.rows.length === 0) {
      throw new Error('Rating not found or does not belong to user');
    }

    const rating = ratingCheck.rows[0];

    // Delete rating
    await pool.query('DELETE FROM ratings WHERE id = $1', [ratingId]);

    // Update aggregated rating
    await updateEntityRating(rating.rated_entity_type, rating.rated_entity_id);

    return { success: true, message: 'Rating deleted' };
  } catch (error) {
    logger.error('Delete rating error:', error);
    throw error;
  }
};

module.exports = {
  submitRating,
  getRatings,
  getRatingSummary,
  updateRating,
  deleteRating,
};
