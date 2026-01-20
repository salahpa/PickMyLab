const labService = require('../services/labService');
const logger = require('../utils/logger');

/**
 * Get all lab partners
 */
const getLabPartners = async (req, res, next) => {
  try {
    const filters = {
      city: req.query.city,
      service_zone: req.query.service_zone,
      min_rating: req.query.min_rating ? parseFloat(req.query.min_rating) : undefined,
    };

    const labs = await labService.getLabPartners(filters);

    res.json({
      success: true,
      data: labs,
    });
  } catch (error) {
    logger.error('Get lab partners controller error:', error);
    next(error);
  }
};

/**
 * Get lab partner by ID
 */
const getLabPartnerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lab = await labService.getLabPartnerById(id);

    res.json({
      success: true,
      data: lab,
    });
  } catch (error) {
    logger.error('Get lab partner by ID controller error:', error);

    if (error.message === 'Lab partner not found') {
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
 * Get lab partner tests
 */
const getLabPartnerTests = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filters = {
      category_id: req.query.category_id,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await labService.getLabPartnerTests(id, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get lab partner tests controller error:', error);
    next(error);
  }
};

module.exports = {
  getLabPartners,
  getLabPartnerById,
  getLabPartnerTests,
};
