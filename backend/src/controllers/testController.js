const testService = require('../services/testService');
const logger = require('../utils/logger');

/**
 * Get all test categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await testService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logger.error('Get categories controller error:', error);
    next(error);
  }
};

/**
 * Get all tests with filters
 */
const getTests = async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      search: req.query.search,
      lab_partner_id: req.query.lab_partner_id,
      min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
      sample_type: req.query.sample_type,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await testService.getTests(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get tests controller error:', error);
    next(error);
  }
};

/**
 * Get test by ID
 */
const getTestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const test = await testService.getTestById(id);

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    logger.error('Get test by ID controller error:', error);

    if (error.message === 'Test not found') {
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
 * Get popular tests
 */
const getPopularTests = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tests = await testService.getPopularTests(limit);

    res.json({
      success: true,
      data: tests,
    });
  } catch (error) {
    logger.error('Get popular tests controller error:', error);
    next(error);
  }
};

/**
 * Get test bundles
 */
const getBundles = async (req, res, next) => {
  try {
    const bundles = await testService.getBundles();

    res.json({
      success: true,
      data: bundles,
    });
  } catch (error) {
    logger.error('Get bundles controller error:', error);
    next(error);
  }
};

/**
 * Get bundle by ID
 */
const getBundleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bundle = await testService.getBundleById(id);

    res.json({
      success: true,
      data: bundle,
    });
  } catch (error) {
    logger.error('Get bundle by ID controller error:', error);

    if (error.message === 'Bundle not found') {
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

module.exports = {
  getCategories,
  getTests,
  getTestById,
  getPopularTests,
  getBundles,
  getBundleById,
};
