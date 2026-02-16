const express = require('express');
const router = express.Router();
const savedSearchController = require('../controllers/savedSearchController');
const { protect } = require('../middleware/auth');

// Protected routes
router.post('/', protect, savedSearchController.createSearch);
router.get('/', protect, savedSearchController.getSearches);
router.get('/:id', protect, savedSearchController.getSearch);
router.delete('/:id', protect, savedSearchController.deleteSearch);

module.exports = router;
