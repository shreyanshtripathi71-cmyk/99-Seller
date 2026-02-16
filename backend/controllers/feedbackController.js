const { Feedback, UserLogin } = require('../models');

// Submit new feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { type, message, rating } = req.body;

        // Get user info if authenticated
        const username = req.user ? req.user.Username : null;
        const email = req.user && req.user.user ? req.user.user.email : (req.body.email || null);

        const newFeedback = await Feedback.create({
            Username: username,
            email: email,
            type: type || 'general',
            message,
            rating: rating || null,
            status: 'new'
        });

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: newFeedback
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit feedback'
        });
    }
};

// Get all feedback (Admin only)
exports.getAllFeedback = async (req, res) => {
    try {
        // Simple admin check (middleware should handle this, but adding double check)
        if (req.user.UserType !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const feedback = await Feedback.findAll({
            order: [['createdAt', 'DESC']],
            include: [{
                model: UserLogin,
                attributes: ['FirstName', 'LastName', 'Email']
            }]
        });

        res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('Get all feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch feedback'
        });
    }
};

// Update feedback status (Admin only)
exports.updateFeedbackStatus = async (req, res) => {
    try {
        if (req.user.UserType !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const feedback = await Feedback.findByPk(id);
        if (!feedback) {
            return res.status(404).json({ success: false, error: 'Feedback not found' });
        }

        await feedback.update({
            status: status || feedback.status,
            adminNotes: adminNotes || feedback.adminNotes
        });

        res.json({
            success: true,
            message: 'Feedback updated successfully',
            data: feedback
        });
    } catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({ success: false, error: 'Failed to update feedback' });
    }
};
