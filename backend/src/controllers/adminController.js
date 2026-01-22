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

/**
 * ============================================
 * TEST CATEGORIES MANAGEMENT
 * ============================================
 */

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await adminService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error('Get all categories controller error:', error);
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await adminService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    logger.error('Create category controller error:', error);
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await adminService.updateCategory(id, req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    logger.error('Update category controller error:', error);
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: error.message },
      });
    }
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteCategory(id);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Delete category controller error:', error);
    if (error.message.includes('Cannot delete')) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      });
    }
    next(error);
  }
};

/**
 * ============================================
 * TESTS MANAGEMENT
 * ============================================
 */

const getAllTestsAdmin = async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 50,
    };
    const result = await adminService.getAllTestsAdmin(filters);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Get all tests admin controller error:', error);
    next(error);
  }
};

const createTest = async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.code) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name and code are required' },
      });
    }
    const test = await adminService.createTest(req.body);
    res.status(201).json({ success: true, data: test });
  } catch (error) {
    logger.error('Create test controller error:', error);
    next(error);
  }
};

const updateTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const test = await adminService.updateTest(id, req.body);
    res.json({ success: true, data: test });
  } catch (error) {
    logger.error('Update test controller error:', error);
    if (error.message === 'Test not found') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: error.message },
      });
    }
    next(error);
  }
};

const deleteTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteTest(id);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Delete test controller error:', error);
    if (error.message.includes('Cannot delete')) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      });
    }
    next(error);
  }
};

/**
 * ============================================
 * LAB PARTNERS MANAGEMENT
 * ============================================
 */

const getAllLabPartners = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      is_active: req.query.is_active,
      page: req.query.page || 1,
      limit: req.query.limit || 50,
    };
    const result = await adminService.getAllLabPartners(filters);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Get all lab partners controller error:', error);
    next(error);
  }
};

const createLabPartner = async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.code) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name and code are required' },
      });
    }
    const labPartner = await adminService.createLabPartner(req.body);
    res.status(201).json({ success: true, data: labPartner });
  } catch (error) {
    logger.error('Create lab partner controller error:', error);
    next(error);
  }
};

const updateLabPartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const labPartner = await adminService.updateLabPartner(id, req.body);
    res.json({ success: true, data: labPartner });
  } catch (error) {
    logger.error('Update lab partner controller error:', error);
    if (error.message === 'Lab partner not found') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: error.message },
      });
    }
    next(error);
  }
};

const deleteLabPartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteLabPartner(id);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Delete lab partner controller error:', error);
    if (error.message.includes('Cannot delete')) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      });
    }
    next(error);
  }
};

/**
 * ============================================
 * TEST PRICING MANAGEMENT
 * ============================================
 */

const getTestPricing = async (req, res, next) => {
  try {
    const { lab_partner_id } = req.params;
    const { test_id } = req.query;
    const pricing = await adminService.getTestPricing(lab_partner_id, test_id);
    res.json({ success: true, data: pricing });
  } catch (error) {
    logger.error('Get test pricing controller error:', error);
    next(error);
  }
};

const upsertTestPricing = async (req, res, next) => {
  try {
    if (!req.body.lab_partner_id || !req.body.test_id || !req.body.price) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Lab partner ID, test ID, and price are required' },
      });
    }
    const pricing = await adminService.upsertTestPricing(req.body);
    res.json({ success: true, data: pricing });
  } catch (error) {
    logger.error('Upsert test pricing controller error:', error);
    next(error);
  }
};

const deleteTestPricing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteTestPricing(id);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Delete test pricing controller error:', error);
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
