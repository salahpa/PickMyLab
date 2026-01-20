const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const reportController = require('../controllers/reportController');
const smartReportController = require('../controllers/smartReportController');
const { upload } = require('../utils/fileUpload');

// User routes (require authentication)
router.get('/', authenticate, reportController.getUserReports);
router.get('/:id', authenticate, reportController.getReportById);
router.get('/:id/download', authenticate, reportController.downloadReport);
router.post('/:id/share', authenticate, reportController.shareReport);
router.get('/:id/smart', authenticate, smartReportController.getSmartReport);
router.post('/:id/smart/generate', authenticate, smartReportController.generateSmartReport);

// Admin/Lab routes (require authentication and lab_staff/admin role)
router.post(
  '/upload',
  authenticate,
  authorize('admin', 'lab_staff'),
  upload.single('report_file'),
  reportController.uploadReport
);

// Public shared report route
router.get('/shared/:token', reportController.getSharedReport);

module.exports = router;
