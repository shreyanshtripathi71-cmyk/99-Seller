const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/billing/overview - Get billing overview
router.get('/overview', billingController.getBillingOverview);

// GET /api/billing/invoices - Get invoice history
router.get('/invoices', billingController.getInvoices);

// GET /api/billing/payment-methods - Get payment methods
router.get('/payment-methods', billingController.getPaymentMethods);

// New features
router.post('/payment-methods', billingController.addPaymentMethod);
router.put('/address', billingController.updateBillingAddress);

// Admin routes
router.get('/admin/invoices', billingController.getAllInvoices);



module.exports = router;
