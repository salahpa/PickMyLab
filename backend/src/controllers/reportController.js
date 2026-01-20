const reportService = require('../services/reportService');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get user reports
 */
const getUserReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      test_id: req.query.test_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await reportService.getUserReports(userId, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get user reports controller error:', error);
    next(error);
  }
};

/**
 * Get report by ID
 */
const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await reportService.getReportById(id, userId);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Get report by ID controller error:', error);

    if (error.message === 'Report not found') {
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
 * Upload report (admin/lab portal)
 */
const uploadReport = async (req, res, next) => {
  try {
    const { booking_id, lab_partner_id, report_date, test_results } = req.body;
    const uploadedBy = req.user.id;

    if (!booking_id || !lab_partner_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID and lab partner ID are required',
        },
      });
    }

    let filePath = null;
    if (req.file) {
      filePath = `/uploads/reports/${req.file.filename}`;
    }

    const reportData = {
      report_date: report_date || new Date(),
      test_results: test_results ? JSON.parse(test_results) : [],
    };

    const report = await reportService.uploadReport(
      booking_id,
      lab_partner_id,
      reportData,
      filePath,
      uploadedBy
    );

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report uploaded successfully',
    });
  } catch (error) {
    logger.error('Upload report controller error:', error);

    if (
      error.message === 'Booking not found or does not belong to this lab partner'
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
 * Share report
 */
const shareReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { email, expiry_days = 7 } = req.body;

    const result = await reportService.shareReport(id, userId, {
      email,
      expiry_days,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Share report controller error:', error);
    next(error);
  }
};

/**
 * Download report
 */
const downloadReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const fileInfo = await reportService.getReportFile(id, userId);

    // In production, serve from S3 or cloud storage
    // For now, serve from local filesystem
    const filePath = path.join(process.cwd(), fileInfo.file_path);

    try {
      await fs.access(filePath);
      res.download(filePath, `${fileInfo.report_number}.pdf`, (err) => {
        if (err) {
          logger.error('Error downloading file:', err);
          res.status(500).json({
            success: false,
            error: {
              code: 'DOWNLOAD_ERROR',
              message: 'Failed to download report',
            },
          });
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Report file not found',
        },
      });
    }
  } catch (error) {
    logger.error('Download report controller error:', error);
    next(error);
  }
};

/**
 * Get shared report
 */
const getSharedReport = async (req, res, next) => {
  try {
    const { token } = req.params;

    const result = await reportService.getSharedReport(token);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get shared report controller error:', error);
    next(error);
  }
};

module.exports = {
  getUserReports,
  getReportById,
  uploadReport,
  shareReport,
  downloadReport,
  getSharedReport,
};
