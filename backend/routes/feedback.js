const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

// Public/Protected route (users can submit feedback)
// Using authenticateToken but making it optional in controller logic if we wanted, 
// but here we likely want to enforce it or handle it gently. 
// For now, let's assume authenticated users.
router.post('/submit', protect, feedbackController.submitFeedback);

// Admin routes
router.get('/all', protect, feedbackController.getAllFeedback);
router.put('/:id', protect, feedbackController.updateFeedbackStatus);

module.exports = router;
