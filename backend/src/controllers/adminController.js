const adminService = require('../services/adminService');
const logger = require('../utils/logger');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;

    const stats = await adminService.getDashboardStats(date_from, date_to);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get dashboard stats controller error:', error);
    next(error);
  }
};

/**
 * Get all bookings
 */
const getAllBookings = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      user_id: req.query.user_id,
      page: req.query.page || 1,
      limit: req.query.limit || 50,
    };

    const result = await adminService.getAllBookings(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get all bookings controller error:', error);
    next(error);
  }
};

/**
 * Update booking status
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updatedBy = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required',
        },
      });
    }

    const result = await adminService.updateBookingStatus(id, status, updatedBy, notes);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Update booking status controller error:', error);
    next(error);
  }
};

/**
 * Get all users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const filters = {
      user_type: req.query.user_type,
      is_active: req.query.is_active,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 50,
    };

    const result = await adminService.getAllUsers(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get all users controller error:', error);
    next(error);
  }
};

/**
 * Update user status
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const updatedBy = req.user.id;

    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'is_active is required',
        },
      });
    }

    const result = await adminService.updateUserStatus(id, is_active, updatedBy);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Update user status controller error:', error);
    next(error);
  }
};

/**
 * Get FAQs
 */
const getFAQs = async (req, res, next) => {
  try {
    const faqs = await adminService.getFAQs();

    res.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    logger.error('Get FAQs controller error:', error);
    next(error);
  }
};

/**
 * Create FAQ
 */
const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, display_order, is_active } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Question and answer are required',
        },
      });
    }

    const faq = await adminService.createFAQ({
      question,
      answer,
      category,
      display_order,
      is_active,
    });

    res.status(201).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    logger.error('Create FAQ controller error:', error);
    next(error);
  }
};

/**
 * Update FAQ
 */
const updateFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, category, display_order, is_active } = req.body;

    const faq = await adminService.updateFAQ(id, {
      question,
      answer,
      category,
      display_order,
      is_active,
    });

    res.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    logger.error('Update FAQ controller error:', error);
    next(error);
  }
};

/**
 * Delete FAQ
 */
const deleteFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteFAQ(id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Delete FAQ controller error:', error);
    next(error);
  }
};

/**
 * Get Terms & Conditions
 */
const getTerms = async (req, res, next) => {
  try {
    const terms = await adminService.getTerms();

    res.json({
      success: true,
      data: terms,
    });
  } catch (error) {
    logger.error('Get terms controller error:', error);
    next(error);
  }
};

/**
 * Update Terms & Conditions
 */
const updateTerms = async (req, res, next) => {
  try {
    const { version, content, effective_from } = req.body;

    if (!version || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Version and content are required',
        },
      });
    }

    const terms = await adminService.updateTerms({
      version,
      content,
      effective_from,
    });

    res.json({
      success: true,
      data: terms,
    });
  } catch (error) {
    logger.error('Update terms controller error:', error);
    next(error);
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
};
