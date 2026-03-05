const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminCore_Controller');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'admin-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp|svg|csv|xlsx|xls/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb(new Error('Invalid file type'));
    }
});

const handleUpload = (fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, error: err.message });
        next();
    });
};

// Public
router.get('/import/template/:target', adminController.getImportTemplate);

// Protected Admin Routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard & Stats
router.get('/stats', adminController.getStats);
router.get('/historical-stats', adminController.getHistoricalStats);
router.get('/activities', adminController.getRecentActivity);

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/upload', adminController.uploadUsersCSV);

// Property Management
router.get('/properties', adminController.getAllProperties);
router.post('/properties', adminController.createProperty);
router.get('/properties/:id', adminController.getPropertyDetails);
router.put('/properties/:id', adminController.updateProperty);
router.delete('/properties/:id', adminController.deleteProperty);
router.post('/properties/:id/image', handleUpload('image'), adminController.uploadPropertyImage);
router.delete('/properties/:id/image', adminController.deletePropertyImage);

// Associations
router.get('/owners', adminController.getAllOwners);
router.get('/owners/stats', adminController.getOwnerStats);
router.get('/owners/:id', adminController.getOwnerDetails);
router.post('/owners', adminController.createOwner);
router.put('/owners/:id', adminController.updateOwner);
router.delete('/owners/:id', adminController.deleteOwner);

router.get('/loans', adminController.getAllLoans);
router.get('/loans/stats', adminController.getLoanStats);
router.get('/loans/:id', adminController.getLoanDetails);
router.post('/loans', adminController.createLoan);
router.put('/loans/:id', adminController.updateLoan);
router.delete('/loans/:id', adminController.deleteLoan);

router.get('/auctions', adminController.getAllAuctions);
router.post('/auctions', adminController.createAuction);
router.put('/auctions/:id', adminController.updateAuction);
router.delete('/auctions/:id', adminController.deleteAuction);

// Subscriptions & Billing (Admin)
router.get('/subscriptions', adminController.getAllSubscriptions);
router.get('/subscriptions/plans', adminController.getPlans);
router.post('/subscriptions/plans', adminController.createOrUpdatePlan);
router.delete('/subscriptions/plans/:id', adminController.deletePlan);
router.post('/subscriptions/:id/cancel', adminController.cancelSubscriberSubscription);
router.get('/billing/invoices', adminController.getAllInvoices);

// Crawler & System
router.get('/crawler/runs', adminController.getCrawlerRuns);
router.get('/crawler/errors', adminController.getCrawlerErrors);
router.post('/import', handleUpload('file'), adminController.importData);

// Content & Feedback (Admin)
router.get('/content', adminController.listContent);
router.post('/content/upload', handleUpload('image'), adminController.uploadContentImage);
router.get('/content/:key', adminController.getContent);
router.post('/content/:key', adminController.updateContent);
router.delete('/content/:key', adminController.deleteContent);

router.get('/feedback/all', adminController.getAllFeedback);
router.put('/feedback/:id', adminController.updateFeedbackStatus);

// Poppins
router.get('/poppins', adminController.getAllPoppins);
router.post('/poppins', adminController.createPoppin);
router.put('/poppins/:id', adminController.updatePoppin);
router.delete('/poppins/:id', adminController.deletePoppin);

// Metadata
router.get('/motive-requirements', adminController.getMotiveTypeRequirements);
router.get('/motive-types', adminController.getMotiveTypes);
router.get('/motive-types/requirements/:code', adminController.getMotiveTypeRequirement);

module.exports = router;
