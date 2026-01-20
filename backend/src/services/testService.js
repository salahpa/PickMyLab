const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get all test categories
 */
const getCategories = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM test_categories 
       WHERE is_active = TRUE 
       ORDER BY display_order ASC, name ASC`
    );

    return result.rows;
  } catch (error) {
    logger.error('Get categories error:', error);
    throw error;
  }
};

/**
 * Get all tests with filters and pagination
 */
const getTests = async (filters = {}) => {
  try {
    const {
      category_id,
      search,
      lab_partner_id,
      min_price,
      max_price,
      sample_type,
      page = 1,
      limit = 20,
    } = filters;

    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Base query
    let query = `
      SELECT DISTINCT
        t.id,
        t.name,
        t.code,
        t.description,
        t.sample_type,
        t.fasting_required,
        t.special_instructions,
        tc.id as category_id,
        tc.name as category_name,
        tc.slug as category_slug
      FROM tests t
      LEFT JOIN test_categories tc ON t.category_id = tc.id
      WHERE t.is_active = TRUE
    `;

    // Apply filters
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

    if (sample_type) {
      conditions.push(`t.sample_type = $${paramCount}`);
      values.push(sample_type);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.name ASC';

    // Get total count
    const countQuery = query.replace(
      'SELECT DISTINCT\n        t.id,',
      'SELECT COUNT(DISTINCT t.id) as total'
    );
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    const tests = result.rows;

    // Get pricing for each test
    for (const test of tests) {
      let pricingQuery = `
        SELECT 
          ltp.id,
          ltp.price,
          ltp.turnaround_time_hours,
          lp.id as lab_partner_id,
          lp.name as lab_partner_name,
          lp.rating,
          lp.total_reviews
        FROM lab_test_pricing ltp
        JOIN lab_partners lp ON ltp.lab_partner_id = lp.id
        WHERE ltp.test_id = $1 AND ltp.is_available = TRUE AND lp.is_active = TRUE
      `;

      const pricingParams = [test.id];
      let pricingParamCount = 2;

      if (lab_partner_id) {
        pricingQuery += ` AND lp.id = $${pricingParamCount}`;
        pricingParams.push(lab_partner_id);
        pricingParamCount++;
      }

      if (min_price !== undefined) {
        pricingQuery += ` AND ltp.price >= $${pricingParamCount}`;
        pricingParams.push(min_price);
        pricingParamCount++;
      }

      if (max_price !== undefined) {
        pricingQuery += ` AND ltp.price <= $${pricingParamCount}`;
        pricingParams.push(max_price);
        pricingParamCount++;
      }

      pricingQuery += ' ORDER BY ltp.price ASC';

      const pricingResult = await pool.query(pricingQuery, pricingParams);
      test.pricing = pricingResult.rows;

      // Calculate min/max price
      if (test.pricing.length > 0) {
        test.min_price = Math.min(...test.pricing.map((p) => parseFloat(p.price)));
        test.max_price = Math.max(...test.pricing.map((p) => parseFloat(p.price)));
      } else {
        test.min_price = null;
        test.max_price = null;
      }
    }

    return {
      tests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Get tests error:', error);
    throw error;
  }
};

/**
 * Get test by ID with full details
 */
const getTestById = async (testId) => {
  try {
    const testResult = await pool.query(
      `SELECT 
        t.*,
        tc.id as category_id,
        tc.name as category_name,
        tc.slug as category_slug
       FROM tests t
       LEFT JOIN test_categories tc ON t.category_id = tc.id
       WHERE t.id = $1 AND t.is_active = TRUE`,
      [testId]
    );

    if (testResult.rows.length === 0) {
      throw new Error('Test not found');
    }

    const test = testResult.rows[0];

    // Get pricing from all labs
    const pricingResult = await pool.query(
      `SELECT 
        ltp.id,
        ltp.price,
        ltp.turnaround_time_hours,
        lp.id as lab_partner_id,
        lp.name as lab_partner_name,
        lp.code as lab_partner_code,
        lp.rating,
        lp.total_reviews,
        lp.service_zones
       FROM lab_test_pricing ltp
       JOIN lab_partners lp ON ltp.lab_partner_id = lp.id
       WHERE ltp.test_id = $1 AND ltp.is_available = TRUE AND lp.is_active = TRUE
       ORDER BY ltp.price ASC`,
      [testId]
    );

    test.pricing = pricingResult.rows;

    // Get related tests (same category)
    if (test.category_id) {
      const relatedResult = await pool.query(
        `SELECT id, name, code, sample_type
         FROM tests
         WHERE category_id = $1 AND id != $2 AND is_active = TRUE
         LIMIT 5`,
        [test.category_id, testId]
      );
      test.related_tests = relatedResult.rows;
    } else {
      test.related_tests = [];
    }

    return test;
  } catch (error) {
    logger.error('Get test by ID error:', error);
    throw error;
  }
};

/**
 * Get popular/trending tests
 */
const getPopularTests = async (limit = 10) => {
  try {
    // Get tests that have been booked recently (last 30 days)
    const result = await pool.query(
      `SELECT 
        t.id,
        t.name,
        t.code,
        t.sample_type,
        tc.name as category_name,
        COUNT(bt.id) as booking_count,
        MIN(ltp.price) as min_price
       FROM tests t
       LEFT JOIN test_categories tc ON t.category_id = tc.id
       LEFT JOIN booking_tests bt ON t.id = bt.test_id
       LEFT JOIN bookings b ON bt.booking_id = b.id
       LEFT JOIN lab_test_pricing ltp ON t.id = ltp.test_id
       WHERE t.is_active = TRUE
         AND (b.created_at >= NOW() - INTERVAL '30 days' OR b.created_at IS NULL)
         AND ltp.is_available = TRUE
       GROUP BY t.id, t.name, t.code, t.sample_type, tc.name
       ORDER BY booking_count DESC, t.name ASC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get popular tests error:', error);
    throw error;
  }
};

/**
 * Get test bundles
 */
const getBundles = async () => {
  try {
    const result = await pool.query(
      `SELECT 
        tb.id,
        tb.name,
        tb.description,
        tb.discount_percentage,
        tc.name as category_name
       FROM test_bundles tb
       LEFT JOIN test_categories tc ON tb.category_id = tc.id
       WHERE tb.is_active = TRUE
       ORDER BY tb.name ASC`
    );

    const bundles = result.rows;

    // Get tests for each bundle
    for (const bundle of bundles) {
      const testsResult = await pool.query(
        `SELECT 
          t.id,
          t.name,
          t.code,
          t.sample_type
         FROM bundle_tests bt
         JOIN tests t ON bt.test_id = t.id
         WHERE bt.bundle_id = $1
         ORDER BY t.name ASC`,
        [bundle.id]
      );

      bundle.tests = testsResult.rows;

      // Calculate bundle pricing
      if (bundle.tests.length > 0) {
        const testIds = bundle.tests.map((t) => t.id);
        const pricingResult = await pool.query(
          `SELECT 
            SUM(MIN(ltp.price)) as total_price
           FROM lab_test_pricing ltp
           WHERE ltp.test_id = ANY($1::uuid[])
             AND ltp.is_available = TRUE
           GROUP BY ltp.lab_partner_id
           ORDER BY total_price ASC
           LIMIT 1`,
          [testIds]
        );

        if (pricingResult.rows.length > 0) {
          const totalPrice = parseFloat(pricingResult.rows[0].total_price);
          bundle.total_price = totalPrice;
          bundle.discounted_price =
            totalPrice * (1 - parseFloat(bundle.discount_percentage) / 100);
        }
      }
    }

    return bundles;
  } catch (error) {
    logger.error('Get bundles error:', error);
    throw error;
  }
};

/**
 * Get bundle by ID
 */
const getBundleById = async (bundleId) => {
  try {
    const bundleResult = await pool.query(
      `SELECT 
        tb.*,
        tc.name as category_name
       FROM test_bundles tb
       LEFT JOIN test_categories tc ON tb.category_id = tc.id
       WHERE tb.id = $1 AND tb.is_active = TRUE`,
      [bundleId]
    );

    if (bundleResult.rows.length === 0) {
      throw new Error('Bundle not found');
    }

    const bundle = bundleResult.rows[0];

    // Get tests
    const testsResult = await pool.query(
      `SELECT 
        t.id,
        t.name,
        t.code,
        t.description,
        t.sample_type
       FROM bundle_tests bt
       JOIN tests t ON bt.test_id = t.id
       WHERE bt.bundle_id = $1
       ORDER BY t.name ASC`,
      [bundleId]
    );

    bundle.tests = testsResult.rows;

    return bundle;
  } catch (error) {
    logger.error('Get bundle by ID error:', error);
    throw error;
  }
};

module.exports = {
  getCategories,
  getTests,
  getTestById,
  getPopularTests,
  getBundles,
  getBundleById,
};
