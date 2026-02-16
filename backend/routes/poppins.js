const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Public route to get active poppins
router.get('/active', adminController.getActivePoppins);

module.exports = router;
