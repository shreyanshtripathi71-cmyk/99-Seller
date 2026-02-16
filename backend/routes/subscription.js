const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/subscription/plans - Get available plans
router.get('/plans', subscriptionController.getPlans);

// GET /api/subscription/status - Get current subscription status
router.get('/status', subscriptionController.getSubscriptionStatus);

// POST /api/subscription/create - Create/Upgrade subscription
router.post('/create', subscriptionController.createSubscription);

// POST /api/subscription/cancel - Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// POST /api/subscription/trial/start - Start trial
router.post('/trial/start', subscriptionController.startTrial);

module.exports = router;
