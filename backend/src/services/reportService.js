const pool = require('../config/database');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// Configure upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/reports';

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    logger.error('Error creating upload directory:', error);
  }
};

/**
 * Get user reports
 */
const getUserReports = async (userId, filters = {}) => {
  try {
    const { test_id, date_from, date_to, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        lr.id,
        lr.report_number,
        lr.report_date,
        lr.status,
        lr.created_at,
        b.id as booking_id,
        b.booking_number,
        lp.name as lab_partner_name,
        lp.id as lab_partner_id
      FROM lab_reports lr
      JOIN bookings b ON lr.booking_id = b.id
      JOIN lab_partners lp ON lr.lab_partner_id = lp.id
      WHERE b.user_id = $1
    `;

    const values = [userId];
    let paramCount = 2;

    if (test_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM booking_tests bt 
        WHERE bt.booking_id = b.id AND bt.test_id = $${paramCount}
      )`;
      values.push(test_id);
      paramCount++;
    }

    if (date_from) {
      query += ` AND lr.report_date >= $${paramCount}`;
      values.push(date_from);
      paramCount++;
    }

    if (date_to) {
      query += ` AND lr.report_date <= $${paramCount}`;
      values.push(date_to);
      paramCount++;
    }

    query += ' ORDER BY lr.report_date DESC, lr.created_at DESC';

    // Get total count - create separate count query
    let countQuery = `
      SELECT COUNT(*) as total
      FROM lab_reports lr
      JOIN bookings b ON lr.booking_id = b.id
      JOIN lab_partners lp ON lr.lab_partner_id = lp.id
      WHERE b.user_id = $1
    `;
    const countValues = [userId];
    let countParamCount = 2;

    if (test_id) {
      countQuery += ` AND EXISTS (
        SELECT 1 FROM booking_tests bt 
        WHERE bt.booking_id = b.id AND bt.test_id = $${countParamCount}
      )`;
      countValues.push(test_id);
      countParamCount++;
    }

    if (date_from) {
      countQuery += ` AND lr.report_date >= $${countParamCount}`;
      countValues.push(date_from);
      countParamCount++;
    }

    if (date_to) {
      countQuery += ` AND lr.report_date <= $${countParamCount}`;
      countValues.push(date_to);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    const reports = result.rows;

    // Get tests for each report
    for (const report of reports) {
      const testsResult = await pool.query(
        `SELECT 
          bt.test_id,
          t.name as test_name,
          t.code as test_code
         FROM booking_tests bt
         JOIN tests t ON bt.test_id = t.id
         WHERE bt.booking_id = $1`,
        [report.booking_id]
      );
      report.tests = testsResult.rows;
    }

    return {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Get user reports error:', error);
    throw error;
  }
};

/**
 * Get report by ID
 */
const getReportById = async (reportId, userId = null) => {
  try {
    let query = `
      SELECT 
        lr.*,
        b.id as booking_id,
        b.booking_number,
        b.user_id,
        lp.name as lab_partner_name,
        lp.code as lab_partner_code
      FROM lab_reports lr
      JOIN bookings b ON lr.booking_id = b.id
      JOIN lab_partners lp ON lr.lab_partner_id = lp.id
      WHERE lr.id = $1
    `;

    const values = [reportId];

    if (userId) {
      query += ' AND b.user_id = $2';
      values.push(userId);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Report not found');
    }

    const report = result.rows[0];

    // Get test results
    const resultsQuery = await pool.query(
      `SELECT 
        rtr.*,
        t.name as test_name,
        t.code as test_code
       FROM report_test_results rtr
       JOIN tests t ON rtr.test_id = t.id
       WHERE rtr.report_id = $1
       ORDER BY t.name, rtr.parameter_name`,
      [reportId]
    );

    report.test_results = resultsQuery.rows;

    // Get booking tests
    const bookingTestsQuery = await pool.query(
      `SELECT 
        bt.test_id,
        t.name as test_name,
        t.code as test_code,
        t.sample_type
       FROM booking_tests bt
       JOIN tests t ON bt.test_id = t.id
       WHERE bt.booking_id = $1`,
      [report.booking_id]
    );

    report.tests = bookingTestsQuery.rows;

    // Check if smart report exists
    const smartReportQuery = await pool.query(
      'SELECT * FROM smart_reports WHERE report_id = $1',
      [reportId]
    );

    report.smart_report = smartReportQuery.rows[0] || null;

    return report;
  } catch (error) {
    logger.error('Get report by ID error:', error);
    throw error;
  }
};

/**
 * Upload report (for admin/lab portal)
 */
const uploadReport = async (bookingId, labPartnerId, reportData, filePath, uploadedBy) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify booking exists and belongs to lab partner
    const bookingCheck = await client.query(
      'SELECT id, user_id FROM bookings WHERE id = $1 AND lab_partner_id = $2',
      [bookingId, labPartnerId]
    );

    if (bookingCheck.rows.length === 0) {
      throw new Error('Booking not found or does not belong to this lab partner');
    }

    // Generate report number
    const reportNumber = `RPT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Create report record
    const reportResult = await client.query(
      `INSERT INTO lab_reports (
        booking_id, lab_partner_id, report_number, report_file_url,
        report_date, status, uploaded_by, uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        bookingId,
        labPartnerId,
        reportNumber,
        filePath,
        reportData.report_date || new Date(),
        'ready',
        uploadedBy,
      ]
    );

    const report = reportResult.rows[0];

    // Insert test results if provided
    if (reportData.test_results && reportData.test_results.length > 0) {
      for (const result of reportData.test_results) {
        await client.query(
          `INSERT INTO report_test_results (
            report_id, test_id, parameter_name, result_value,
            unit, reference_range, status, flagged, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            report.id,
            result.test_id,
            result.parameter_name,
            result.result_value,
            result.unit || null,
            result.reference_range || null,
            result.status || 'normal',
            result.flagged || false,
            result.notes || null,
          ]
        );
      }
    }

    // Update booking status
    await client.query(
      `UPDATE bookings 
       SET report_ready_at = NOW(),
           booking_status = CASE 
             WHEN booking_status = 'sample_delivered' THEN 'processing'
             WHEN booking_status = 'processing' THEN 'completed'
             ELSE booking_status
           END,
           updated_at = NOW()
       WHERE id = $1`,
      [bookingId]
    );

    await client.query('COMMIT');

    return report;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Upload report error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Share report
 */
const shareReport = async (reportId, userId, shareData) => {
  try {
    // Verify report belongs to user
    const reportCheck = await pool.query(
      `SELECT lr.id FROM lab_reports lr
       JOIN bookings b ON lr.booking_id = b.id
       WHERE lr.id = $1 AND b.user_id = $2`,
      [reportId, userId]
    );

    if (reportCheck.rows.length === 0) {
      throw new Error('Report not found');
    }

    // Generate share token
    const shareToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (shareData.expiry_days || 7));

    // Store share link (you can create a shares table or use metadata)
    // For now, we'll return the token
    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reports/shared/${shareToken}`;

    return {
      share_link: shareLink,
      share_token: shareToken,
      expires_at: expiresAt,
      message: 'Report shared successfully',
    };
  } catch (error) {
    logger.error('Share report error:', error);
    throw error;
  }
};

/**
 * Get shared report (by token)
 */
const getSharedReport = async (shareToken) => {
  try {
    // In production, verify token from shares table
    // For now, this is a placeholder
    // You would have a shares table with token, report_id, expires_at, etc.

    return {
      message: 'Shared report access (implementation pending)',
      token: shareToken,
    };
  } catch (error) {
    logger.error('Get shared report error:', error);
    throw error;
  }
};

/**
 * Download report file
 */
const getReportFile = async (reportId, userId = null) => {
  try {
    let query = `
      SELECT lr.report_file_url, lr.report_number
      FROM lab_reports lr
      JOIN bookings b ON lr.booking_id = b.id
      WHERE lr.id = $1
    `;

    const values = [reportId];

    if (userId) {
      query += ' AND b.user_id = $2';
      values.push(userId);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Report not found');
    }

    const report = result.rows[0];

    // In production, read file from storage (S3, local filesystem, etc.)
    // For now, return file path
    return {
      file_path: report.report_file_url,
      report_number: report.report_number,
    };
  } catch (error) {
    logger.error('Get report file error:', error);
    throw error;
  }
};

module.exports = {
  getUserReports,
  getReportById,
  uploadReport,
  shareReport,
  getSharedReport,
  getReportFile,
  ensureUploadDir,
};
