const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Search properties - Accessible to all, but premium data requires auth
router.get('/', optionalAuth, propertyController.searchProperties);
router.get('/:id', optionalAuth, propertyController.getProperty);

module.exports = router;
