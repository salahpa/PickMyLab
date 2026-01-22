const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (dateFrom = null, dateTo = null) => {
  try {
    const dateFilter = dateFrom && dateTo 
      ? `WHERE created_at >= '${dateFrom}' AND created_at <= '${dateTo}'`
      : dateFrom
      ? `WHERE created_at >= '${dateFrom}'`
      : '';

    // Total bookings
    const bookingsResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE booking_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE booking_status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE booking_status = 'completed') as completed,
        COUNT(*) FILTER (WHERE booking_status = 'cancelled') as cancelled
       FROM bookings ${dateFilter}`
    );

    // Total revenue
    const revenueResult = await pool.query(
      `SELECT 
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COUNT(*) as total_paid_bookings
       FROM bookings 
       WHERE payment_status = 'completed' ${dateFilter.replace('created_at', 'created_at')}`
    );

    // Total users
    const usersResult = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE user_type = 'patient') as patients,
        COUNT(*) FILTER (WHERE user_type = 'phlebotomist') as phlebotomists,
        COUNT(*) FILTER (WHERE user_type = 'lab_staff') as lab_staff
       FROM users ${dateFilter}`
    );

    // Total reports
    const reportsResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'ready') as ready
       FROM lab_reports ${dateFilter}`
    );

    // Recent bookings (last 10)
    const recentBookings = await pool.query(
      `SELECT 
        b.id,
        b.booking_number,
        b.booking_status,
        b.final_amount,
        b.created_at,
        u.first_name || ' ' || u.last_name as patient_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC
       LIMIT 10`
    );

    // Bookings by status (for chart)
    const bookingsByStatus = await pool.query(
      `SELECT 
        booking_status,
        COUNT(*) as count
       FROM bookings
       GROUP BY booking_status`
    );

    // Revenue by day (last 30 days)
    const revenueByDay = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        SUM(final_amount) as revenue,
        COUNT(*) as bookings
       FROM bookings
       WHERE payment_status = 'completed'
         AND created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    return {
      bookings: {
        total: parseInt(bookingsResult.rows[0].total) || 0,
        pending: parseInt(bookingsResult.rows[0].pending) || 0,
        confirmed: parseInt(bookingsResult.rows[0].confirmed) || 0,
        completed: parseInt(bookingsResult.rows[0].completed) || 0,
        cancelled: parseInt(bookingsResult.rows[0].cancelled) || 0,
        by_status: bookingsByStatus.rows,
      },
      revenue: {
        total: parseFloat(revenueResult.rows[0].total_revenue) || 0,
        paid_bookings: parseInt(revenueResult.rows[0].total_paid_bookings) || 0,
        by_day: revenueByDay.rows,
      },
      users: {
        patients: parseInt(usersResult.rows[0].patients) || 0,
        phlebotomists: parseInt(usersResult.rows[0].phlebotomists) || 0,
        lab_staff: parseInt(usersResult.rows[0].lab_staff) || 0,
      },
      reports: {
        total: parseInt(reportsResult.rows[0].total) || 0,
        ready: parseInt(reportsResult.rows[0].ready) || 0,
      },
      recent_bookings: recentBookings.rows,
    };
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    throw error;
  }
};

/**
 * Get all bookings (admin view)
 */
const getAllBookings = async (filters = {}) => {
  try {
    const { status, date_from, date_to, user_id, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.*,
        u.first_name || ' ' || u.last_name as patient_name,
        u.phone as patient_phone,
        u.email as patient_email,
        lp.name as lab_partner_name,
        ph.first_name || ' ' || ph.last_name as phlebotomist_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN lab_partners lp ON b.lab_partner_id = lp.id
      LEFT JOIN users ph ON b.phlebotomist_id = ph.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (status) {
      query += ` AND b.booking_status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (date_from) {
      query += ` AND b.preferred_date >= $${paramCount}`;
      values.push(date_from);
      paramCount++;
    }

    if (date_to) {
      query += ` AND b.preferred_date <= $${paramCount}`;
      values.push(date_to);
      paramCount++;
    }

    if (user_id) {
      query += ` AND b.user_id = $${paramCount}`;
      values.push(user_id);
      paramCount++;
    }

    query += ' ORDER BY b.created_at DESC';

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
    logger.error('Get all bookings error:', error);
    throw error;
  }
};

/**
 * Update booking status (admin)
 */
const updateBookingStatus = async (bookingId, status, updatedBy, notes = null) => {
  try {
    await pool.query(
      `UPDATE bookings 
       SET booking_status = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [status, bookingId]
    );

    // Log status change
    await pool.query(
      `INSERT INTO booking_status_logs (
        booking_id, status, updated_by, notes, created_at
      ) VALUES ($1, $2, $3, $4, NOW())`,
      [bookingId, status, updatedBy, notes]
    );

    return {
      success: true,
      message: 'Booking status updated',
    };
  } catch (error) {
    logger.error('Update booking status error:', error);
    throw error;
  }
};

/**
 * Get all users (admin)
 */
const getAllUsers = async (filters = {}) => {
  try {
    const { user_type, is_active, search, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id,
        email,
        phone,
        first_name,
        last_name,
        user_type,
        is_active,
        is_verified,
        created_at,
        last_login
      FROM users
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (user_type) {
      query += ` AND user_type = $${paramCount}`;
      values.push(user_type);
      paramCount++;
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      values.push(is_active);
      paramCount++;
    }

    if (search) {
      query += ` AND (
        first_name ILIKE $${paramCount} OR
        last_name ILIKE $${paramCount} OR
        email ILIKE $${paramCount} OR
        phone ILIKE $${paramCount}
      )`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    // Get total count
    const countQuery = query.replace('SELECT \n        id,', 'SELECT COUNT(*) as total');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Get all users error:', error);
    throw error;
  }
};

/**
 * Update user status (admin)
 */
const updateUserStatus = async (userId, isActive, updatedBy) => {
  try {
    await pool.query(
      `UPDATE users 
       SET is_active = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [isActive, userId]
    );

    return {
      success: true,
      message: 'User status updated',
    };
  } catch (error) {
    logger.error('Update user status error:', error);
    throw error;
  }
};

/**
 * Get FAQs
 */
const getFAQs = async () => {
  try {
    const result = await pool.query(
      'SELECT * FROM faqs WHERE is_active = true ORDER BY display_order, created_at'
    );
    return result.rows;
  } catch (error) {
    logger.error('Get FAQs error:', error);
    throw error;
  }
};

/**
 * Create FAQ
 */
const createFAQ = async (faqData) => {
  try {
    const result = await pool.query(
      `INSERT INTO faqs (
        question, answer, category, display_order, is_active
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        faqData.question,
        faqData.answer,
        faqData.category || null,
        faqData.display_order || 0,
        faqData.is_active !== undefined ? faqData.is_active : true,
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Create FAQ error:', error);
    throw error;
  }
};

/**
 * Update FAQ
 */
const updateFAQ = async (faqId, faqData) => {
  try {
    const result = await pool.query(
      `UPDATE faqs 
       SET question = $1,
           answer = $2,
           category = $3,
           display_order = $4,
           is_active = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        faqData.question,
        faqData.answer,
        faqData.category || null,
        faqData.display_order || 0,
        faqData.is_active !== undefined ? faqData.is_active : true,
        faqId,
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Update FAQ error:', error);
    throw error;
  }
};

/**
 * Delete FAQ
 */
const deleteFAQ = async (faqId) => {
  try {
    await pool.query('DELETE FROM faqs WHERE id = $1', [faqId]);
    return { success: true, message: 'FAQ deleted' };
  } catch (error) {
    logger.error('Delete FAQ error:', error);
    throw error;
  }
};

/**
 * Get Terms & Conditions
 */
const getTerms = async () => {
  try {
    const result = await pool.query(
      'SELECT * FROM terms_conditions WHERE is_active = true ORDER BY effective_from DESC LIMIT 1'
    );
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Get terms error:', error);
    throw error;
  }
};

/**
 * Create/Update Terms & Conditions
 */
const updateTerms = async (termsData) => {
  try {
    // Deactivate old terms
    await pool.query(
      'UPDATE terms_conditions SET is_active = false WHERE is_active = true'
    );

    // Create new terms
    const result = await pool.query(
      `INSERT INTO terms_conditions (
        version, content, is_active, effective_from
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        termsData.version,
        termsData.content,
        true,
        termsData.effective_from || new Date(),
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Update terms error:', error);
    throw error;
  }
};

/**
 * ============================================
 * TEST CATEGORIES MANAGEMENT
 * ============================================
 */

/**
 * Get all test categories (admin)
 */
const getAllCategories = async () => {
  try {
    const result = await pool.query(
      'SELECT * FROM test_categories ORDER BY display_order ASC, name ASC'
    );
    return result.rows;
  } catch (error) {
    logger.error('Get all categories error:', error);
    throw error;
  }
};

/**
 * Create test category
 */
const createCategory = async (categoryData) => {
  try {
    const { name, slug, description, icon_url, display_order, is_active } = categoryData;
    
    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const result = await pool.query(
      `INSERT INTO test_categories (
        name, slug, description, icon_url, display_order, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        name,
        finalSlug,
        description || null,
        icon_url || null,
        display_order || 0,
        is_active !== undefined ? is_active : true,
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Create category error:', error);
    throw error;
  }
};

/**
 * Update test category
 */
const updateCategory = async (categoryId, categoryData) => {
  try {
    const { name, slug, description, icon_url, display_order, is_active } = categoryData;
    
    const result = await pool.query(
      `UPDATE test_categories 
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           icon_url = COALESCE($4, icon_url),
           display_order = COALESCE($5, display_order),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, slug, description, icon_url, display_order, is_active, categoryId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Category not found');
    }
    
    return result.rows[0];
  } catch (error) {
    logger.error('Update category error:', error);
    throw error;
  }
};

/**
 * Delete test category
 */
const deleteCategory = async (categoryId) => {
  try {
    // Check if category has tests
    const testsResult = await pool.query(
      'SELECT COUNT(*) as count FROM tests WHERE category_id = $1',
      [categoryId]
    );
    
    if (parseInt(testsResult.rows[0].count) > 0) {
      throw new Error('Cannot delete category with existing tests');
    }
    
    await pool.query('DELETE FROM test_categories WHERE id = $1', [categoryId]);
    return { success: true, message: 'Category deleted' };
  } catch (error) {
    logger.error('Delete category error:', error);
    throw error;
  }
};

/**
 * ============================================
 * TESTS MANAGEMENT
 * ============================================
 */

/**
 * Get all tests (admin)
 */
const getAllTestsAdmin = async (filters = {}) => {
  try {
    const { category_id, search, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        t.*,
        tc.name as category_name
      FROM tests t
      LEFT JOIN test_categories tc ON t.category_id = tc.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (category_id) {
      query += ` AND t.category_id = $${paramCount}`;
      values.push(category_id);
      paramCount++;
    }
    
    if (search) {
      query += ` AND (
        t.name ILIKE $${paramCount} OR
        t.code ILIKE $${paramCount} OR
        t.description ILIKE $${paramCount}
      )`;
      values.push(`%${search}%`);
      paramCount++;
    }
    
    query += ' ORDER BY t.name ASC';
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM tests t
      WHERE 1=1
    `;
    const countValues = [];
    let countParamCount = 1;
    
    if (category_id) {
      countQuery += ` AND t.category_id = $${countParamCount}`;
      countValues.push(category_id);
      countParamCount++;
    }
    
    if (search) {
      countQuery += ` AND (
        t.name ILIKE $${countParamCount} OR
        t.code ILIKE $${countParamCount} OR
        t.description ILIKE $${countParamCount}
      )`;
      countValues.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countValues);
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
    logger.error('Get all tests admin error:', error);
    throw error;
  }
};

/**
 * Create test
 */
const createTest = async (testData) => {
  try {
    const {
      name,
      code,
      category_id,
      description,
      sample_type,
      fasting_required,
      special_instructions,
      is_active,
    } = testData;
    
    const result = await pool.query(
      `INSERT INTO tests (
        name, code, category_id, description, sample_type,
        fasting_required, special_instructions, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        name,
        code,
        category_id || null,
        description || null,
        sample_type || 'blood',
        fasting_required || false,
        special_instructions || null,
        is_active !== undefined ? is_active : true,
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Create test error:', error);
    throw error;
  }
};

/**
 * Update test
 */
const updateTest = async (testId, testData) => {
  try {
    const {
      name,
      code,
      category_id,
      description,
      sample_type,
      fasting_required,
      special_instructions,
      is_active,
    } = testData;
    
    const result = await pool.query(
      `UPDATE tests 
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           category_id = COALESCE($3, category_id),
           description = COALESCE($4, description),
           sample_type = COALESCE($5, sample_type),
           fasting_required = COALESCE($6, fasting_required),
           special_instructions = COALESCE($7, special_instructions),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        name,
        code,
        category_id,
        description,
        sample_type,
        fasting_required,
        special_instructions,
        is_active,
        testId,
      ]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Test not found');
    }
    
    return result.rows[0];
  } catch (error) {
    logger.error('Update test error:', error);
    throw error;
  }
};

/**
 * Delete test
 */
const deleteTest = async (testId) => {
  try {
    // Check if test has bookings
    const bookingsResult = await pool.query(
      'SELECT COUNT(*) as count FROM booking_tests WHERE test_id = $1',
      [testId]
    );
    
    if (parseInt(bookingsResult.rows[0].count) > 0) {
      throw new Error('Cannot delete test with existing bookings');
    }
    
    await pool.query('DELETE FROM tests WHERE id = $1', [testId]);
    return { success: true, message: 'Test deleted' };
  } catch (error) {
    logger.error('Delete test error:', error);
    throw error;
  }
};

/**
 * ============================================
 * LAB PARTNERS MANAGEMENT
 * ============================================
 */

/**
 * Get all lab partners (admin)
 */
const getAllLabPartners = async (filters = {}) => {
  try {
    const { search, is_active, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT * FROM lab_partners
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (
        name ILIKE $${paramCount} OR
        code ILIKE $${paramCount} OR
        city ILIKE $${paramCount}
      )`;
      values.push(`%${search}%`);
      paramCount++;
    }
    
    if (is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      values.push(is_active);
      paramCount++;
    }
    
    query += ' ORDER BY name ASC';
    
    // Get total count
    let countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);
    
    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);
    
    const result = await pool.query(query, values);
    
    return {
      lab_partners: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Get all lab partners error:', error);
    throw error;
  }
};

/**
 * Create lab partner
 */
const createLabPartner = async (labData) => {
  try {
    const {
      name,
      code,
      contact_email,
      contact_phone,
      address,
      city,
      service_zones,
      commission_percentage,
      is_active,
    } = labData;
    
    const result = await pool.query(
      `INSERT INTO lab_partners (
        name, code, contact_email, contact_phone, address, city,
        service_zones, commission_percentage, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        name,
        code,
        contact_email || null,
        contact_phone || null,
        address || null,
        city || null,
        service_zones || [],
        commission_percentage || null,
        is_active !== undefined ? is_active : true,
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Create lab partner error:', error);
    throw error;
  }
};

/**
 * Update lab partner
 */
const updateLabPartner = async (labId, labData) => {
  try {
    const {
      name,
      code,
      contact_email,
      contact_phone,
      address,
      city,
      service_zones,
      commission_percentage,
      is_active,
    } = labData;
    
    const result = await pool.query(
      `UPDATE lab_partners 
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           contact_email = COALESCE($3, contact_email),
           contact_phone = COALESCE($4, contact_phone),
           address = COALESCE($5, address),
           city = COALESCE($6, city),
           service_zones = COALESCE($7, service_zones),
           commission_percentage = COALESCE($8, commission_percentage),
           is_active = COALESCE($9, is_active),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        name,
        code,
        contact_email,
        contact_phone,
        address,
        city,
        service_zones,
        commission_percentage,
        is_active,
        labId,
      ]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Lab partner not found');
    }
    
    return result.rows[0];
  } catch (error) {
    logger.error('Update lab partner error:', error);
    throw error;
  }
};

/**
 * Delete lab partner
 */
const deleteLabPartner = async (labId) => {
  try {
    // Check if lab has bookings
    const bookingsResult = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE lab_partner_id = $1',
      [labId]
    );
    
    if (parseInt(bookingsResult.rows[0].count) > 0) {
      throw new Error('Cannot delete lab partner with existing bookings');
    }
    
    await pool.query('DELETE FROM lab_partners WHERE id = $1', [labId]);
    return { success: true, message: 'Lab partner deleted' };
  } catch (error) {
    logger.error('Delete lab partner error:', error);
    throw error;
  }
};

/**
 * ============================================
 * TEST PRICING MANAGEMENT
 * ============================================
 */

/**
 * Get test pricing for a lab partner
 */
const getTestPricing = async (labPartnerId, testId = null) => {
  try {
    let query = `
      SELECT 
        ltp.*,
        t.name as test_name,
        t.code as test_code,
        lp.name as lab_partner_name
      FROM lab_test_pricing ltp
      JOIN tests t ON ltp.test_id = t.id
      JOIN lab_partners lp ON ltp.lab_partner_id = lp.id
      WHERE ltp.lab_partner_id = $1
    `;
    
    const values = [labPartnerId];
    
    if (testId) {
      query += ' AND ltp.test_id = $2';
      values.push(testId);
    }
    
    query += ' ORDER BY t.name ASC';
    
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    logger.error('Get test pricing error:', error);
    throw error;
  }
};

/**
 * Create/Update test pricing
 */
const upsertTestPricing = async (pricingData) => {
  try {
    const { lab_partner_id, test_id, price, turnaround_time_hours, is_available } = pricingData;
    
    const result = await pool.query(
      `INSERT INTO lab_test_pricing (
        lab_partner_id, test_id, price, turnaround_time_hours, is_available
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (lab_partner_id, test_id)
      DO UPDATE SET
        price = EXCLUDED.price,
        turnaround_time_hours = EXCLUDED.turnaround_time_hours,
        is_available = EXCLUDED.is_available,
        updated_at = NOW()
      RETURNING *`,
      [
        lab_partner_id,
        test_id,
        price,
        turnaround_time_hours || 24,
        is_available !== undefined ? is_available : true,
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Upsert test pricing error:', error);
    throw error;
  }
};

/**
 * Delete test pricing
 */
const deleteTestPricing = async (pricingId) => {
  try {
    await pool.query('DELETE FROM lab_test_pricing WHERE id = $1', [pricingId]);
    return { success: true, message: 'Test pricing deleted' };
  } catch (error) {
    logger.error('Delete test pricing error:', error);
    throw error;
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  updateUserStatus,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getTerms,
  updateTerms,
  // Test Categories
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Tests
  getAllTestsAdmin,
  createTest,
  updateTest,
  deleteTest,
  // Lab Partners
  getAllLabPartners,
  createLabPartner,
  updateLabPartner,
  deleteLabPartner,
  // Test Pricing
  getTestPricing,
  upsertTestPricing,
  deleteTestPricing,
};
