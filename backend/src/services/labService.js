const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get all lab partners
 */
const getLabPartners = async (filters = {}) => {
  try {
    const { city, service_zone, min_rating } = filters;

    let query = `
      SELECT 
        id,
        name,
        code,
        contact_email,
        contact_phone,
        address,
        city,
        service_zones,
        rating,
        total_reviews,
        is_active
      FROM lab_partners
      WHERE is_active = TRUE
    `;

    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (city) {
      conditions.push(`city = $${paramCount}`);
      values.push(city);
      paramCount++;
    }

    if (service_zone) {
      conditions.push(`$${paramCount} = ANY(service_zones)`);
      values.push(service_zone);
      paramCount++;
    }

    if (min_rating !== undefined) {
      conditions.push(`rating >= $${paramCount}`);
      values.push(min_rating);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY rating DESC, name ASC';

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    logger.error('Get lab partners error:', error);
    throw error;
  }
};

/**
 * Get lab partner by ID
 */
const getLabPartnerById = async (labId) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        name,
        code,
        contact_email,
        contact_phone,
        address,
        city,
        service_zones,
        rating,
        total_reviews,
        is_active
       FROM lab_partners
       WHERE id = $1`,
      [labId]
    );

    if (result.rows.length === 0) {
      throw new Error('Lab partner not found');
    }

    const lab = result.rows[0];

    // Get available tests count
    const testsCount = await pool.query(
      `SELECT COUNT(DISTINCT test_id) as count
       FROM lab_test_pricing
       WHERE lab_partner_id = $1 AND is_available = TRUE`,
      [labId]
    );

    lab.available_tests_count = parseInt(testsCount.rows[0].count);

    // Get recent reviews (if ratings table exists)
    // This would require the ratings table to be populated

    return lab;
  } catch (error) {
    logger.error('Get lab partner by ID error:', error);
    throw error;
  }
};

/**
 * Get lab partner tests
 */
const getLabPartnerTests = async (labId, filters = {}) => {
  try {
    const { category_id, search, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.id,
        t.name,
        t.code,
        t.description,
        t.sample_type,
        ltp.price,
        ltp.turnaround_time_hours,
        tc.name as category_name
      FROM lab_test_pricing ltp
      JOIN tests t ON ltp.test_id = t.id
      LEFT JOIN test_categories tc ON t.category_id = tc.id
      WHERE ltp.lab_partner_id = $1 
        AND ltp.is_available = TRUE 
        AND t.is_active = TRUE
    `;

    const conditions = [];
    const values = [labId];
    let paramCount = 2;

    if (category_id) {
      conditions.push(`t.category_id = $${paramCount}`);
      values.push(category_id);
      paramCount++;
    }

    if (search) {
      conditions.push(
        `(t.name ILIKE $${paramCount} OR t.description ILIKE $${paramCount} OR t.code ILIKE $${paramCount})`
      );
      values.push(`%${search}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.name ASC';

    // Get total count
    const countQuery = query.replace(
      'SELECT \n        t.id,',
      'SELECT COUNT(DISTINCT t.id) as total'
    );
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      tests: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Get lab partner tests error:', error);
    throw error;
  }
};

module.exports = {
  getLabPartners,
  getLabPartnerById,
  getLabPartnerTests,
};
