const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserCore_Controller');
const { protect, optionalAuth } = require('../middleware/auth');

/**
 * ==========================================
 * PUBLIC / AUTH ROUTES
 * ==========================================
 */

// Public Content (readable by frontend without auth)
router.get('/content/:key', async (req, res) => {
    try {
        const db = require('../models');
        const content = await db.SiteContent.findOne({ where: { key: req.params.key } });
        if (!content) return res.status(404).json({ success: false, error: 'Content not found' });
        let value = content.value;
        if (typeof value === 'string') {
            try { value = JSON.parse(value); } catch (e) { /* keep as string */ }
        }
        res.json({ success: true, data: { key: content.key, value } });
    } catch (err) {
        console.error('Public content fetch error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

router.post('/auth/login', userController.login);
router.post('/auth/register', userController.register);
router.post('/auth/forgot-password', (req, res) => res.json({ success: true, message: 'Placeholder' }));
router.post('/auth/reset-password', (req, res) => res.json({ success: true, message: 'Placeholder' }));

// Search (Optional Auth for masked data)
router.get('/properties', optionalAuth, userController.searchProperties);
router.get('/properties/:id', optionalAuth, userController.getPropertyDetails);

/**
 * ==========================================
 * PROTECTED USER ROUTES
 * ==========================================
 */

router.use(protect);

// Profile
router.put('/auth/update-profile', userController.updateProfile);
router.put('/auth/change-password', userController.changePassword);
router.get('/auth/profile', userController.getProfile);

// Saved Items
router.post('/saved-properties', userController.saveProperty);
router.get('/saved-properties', userController.getSavedProperties);
router.delete('/saved-properties/:id', userController.removeSavedProperty);

router.post('/saved-searches', userController.createSavedSearch);
router.get('/saved-searches', userController.getSavedSearches);
router.delete('/saved-searches/:id', userController.deleteSavedSearch);

// Subscriptions & Billing
router.get('/subscription/status', userController.getSubscriptionStatus);
router.post('/subscription/create', userController.createSubscription);
router.get('/billing/invoices', userController.getInvoices);
router.get('/billing/overview', (req, res) => res.json({ success: true, data: {} })); // Placeholder

// Payments
router.post('/payments/create-intent', userController.createPaymentIntent);
router.post('/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => res.json({ received: true })); // Placeholder

// Other
router.post('/feedback/submit', userController.submitFeedback);
router.get('/export/usage', userController.getExportUsage);

module.exports = router;
