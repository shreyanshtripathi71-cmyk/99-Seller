const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Public route to get site content
router.get('/:key', adminController.getContent);

module.exports = router;
