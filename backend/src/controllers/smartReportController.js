const smartReportService = require('../services/smartReportService');
const logger = require('../utils/logger');

/**
 * Get smart report
 */
const getSmartReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const smartReport = await smartReportService.getSmartReport(id, userId);

    res.json({
      success: true,
      data: smartReport,
    });
  } catch (error) {
    logger.error('Get smart report controller error:', error);

    if (error.message === 'Smart report not found') {
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
 * Generate smart report
 */
const generateSmartReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const smartReport = await smartReportService.generateSmartReport(id, userId);

    res.json({
      success: true,
      data: smartReport,
      message: 'Smart report generated successfully',
    });
  } catch (error) {
    logger.error('Generate smart report controller error:', error);
    next(error);
  }
};

module.exports = {
  getSmartReport,
  generateSmartReport,
};
