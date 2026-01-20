const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');

// Public routes
router.get('/', labController.getLabPartners);
router.get('/:id', labController.getLabPartnerById);
router.get('/:id/tests', labController.getLabPartnerTests);

module.exports = router;
