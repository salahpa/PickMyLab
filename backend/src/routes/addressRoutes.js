const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const addressController = require('../controllers/addressController');

// All address routes require authentication
router.use(authenticate);

router.get('/', addressController.getAddresses);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
