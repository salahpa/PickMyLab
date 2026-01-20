const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Public routes
router.get('/categories', testController.getCategories);
router.get('/popular', testController.getPopularTests);
router.get('/bundles', testController.getBundles);
router.get('/bundles/:id', testController.getBundleById);
router.get('/:id', testController.getTestById);
router.get('/', testController.getTests);

module.exports = router;
