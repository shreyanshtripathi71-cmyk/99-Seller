const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// POST /api/export/saved-leads - Export saved leads
router.post('/saved-leads', exportController.exportSavedLeads);

// GET /api/export/history - Get export history
router.get('/history', exportController.getExportHistory);

// GET /api/export/usage - Get export usage and limits
router.get('/usage', exportController.getExportUsage);

module.exports = router;
