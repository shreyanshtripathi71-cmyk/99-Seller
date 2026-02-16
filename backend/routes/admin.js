const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for content uploads
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure directory exists on every upload (in case it was deleted)
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'content-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp|svg/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype || extname) return cb(null, true);
        cb(new Error('Only images (jpeg, jpg, png, gif, webp, svg) are allowed'));
    }
});

// Wrapper to handle multer errors and return JSON responses
const handleUpload = (fieldName) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.single(fieldName);
        uploadMiddleware(req, res, (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    // Multer-specific errors (file too large, unexpected field, etc.)
                    let message = 'Upload error';
                    if (err.code === 'LIMIT_FILE_SIZE') message = 'File is too large. Maximum size is 10MB.';
                    else if (err.code === 'LIMIT_UNEXPECTED_FILE') message = 'Unexpected file field.';
                    else message = err.message;
                    return res.status(400).json({ success: false, error: message });
                }
                // Custom errors from fileFilter
                return res.status(400).json({ success: false, error: err.message });
            }
            next();
        });
    };
};

const dataUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /csv|xlsx|xls/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // Multer mimetype for csv can be text/csv, but xlsx is more complex. Check extension.
        if (extname) return cb(null, true);
        cb(new Error('Only CSV or Excel files are allowed'));
    }
});

// Wrapper for data upload errors
const handleDataUpload = (fieldName) => {
    return (req, res, next) => {
        const uploadMiddleware = dataUpload.single(fieldName);
        uploadMiddleware(req, res, (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    let message = 'Upload error';
                    if (err.code === 'LIMIT_FILE_SIZE') message = 'File is too large. Maximum size is 10MB.';
                    else if (err.code === 'LIMIT_UNEXPECTED_FILE') message = 'Unexpected file field.';
                    else message = err.message;
                    return res.status(400).json({ success: false, error: message });
                }
                return res.status(400).json({ success: false, error: err.message });
            }
            next();
        });
    };
};

// Public Import Templates (Safe for all to download)
router.get('/import/template/:target', adminController.getImportTemplate);

// All routes here require being an admin
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/historical-stats', adminController.getHistoricalStats);
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/upload', adminController.uploadUsersCSV);

// Owner Routes
router.get('/owners', adminController.getAllOwners);
router.get('/owners/stats', adminController.getOwnerStats);
router.get('/owners/:id', adminController.getOwnerDetails);
router.post('/owners', adminController.createOwner);
router.put('/owners/:id', adminController.updateOwner);
router.delete('/owners/:id', adminController.deleteOwner);

// Loan Routes
router.get('/loans', adminController.getAllLoans);
router.get('/loans/stats', adminController.getLoanStats);
router.get('/loans/:id', adminController.getLoanDetails);
router.post('/loans', adminController.createLoan);
router.put('/loans/:id', adminController.updateLoan);
router.delete('/loans/:id', adminController.deleteLoan);
router.get('/subscriptions', adminController.getAllSubscriptions);
router.get('/subscriptions/plans', adminController.getPlans);
router.post('/subscriptions/plans', adminController.createOrUpdatePlan);
router.delete('/subscriptions/plans/:id', adminController.deletePlan);
router.post('/subscriptions/:id/cancel', adminController.cancelSubscription);
// Property Management
router.get('/properties', adminController.getAllProperties);
router.post('/properties', adminController.createProperty);
router.get('/properties/:id', adminController.getPropertyDetails);
router.put('/properties/:id', adminController.updateProperty);
router.delete('/properties/:id', adminController.deleteProperty);
router.post('/properties/:id/image', handleUpload('image'), adminController.uploadPropertyImage);
router.delete('/properties/:id/image', adminController.deletePropertyImage);

// Motive Type Requirements Routes
router.get('/motive-requirements', adminController.getMotiveTypeRequirements);
router.get('/motive-types', adminController.getMotiveTypes);
router.get('/motive-types/requirements/:code', adminController.getMotiveTypeRequirement);

router.get('/crawler/runs', adminController.getCrawlerRuns);
router.get('/crawler/errors', adminController.getCrawlerErrors);

// Auction Routes
router.get('/auctions', adminController.getAllAuctions);
router.post('/auctions', adminController.createAuction);
router.put('/auctions/:id', adminController.updateAuction);
router.delete('/auctions/:id', adminController.deleteAuction);

// Data Import Routes
router.post('/import', handleDataUpload('file'), adminController.importData);

// Poppins Routes
router.get('/poppins', adminController.getAllPoppins);
router.post('/poppins', adminController.createPoppin);
router.put('/poppins/:id', adminController.updatePoppin);
router.delete('/poppins/:id', adminController.deletePoppin);

// Site Content Routes
router.get('/content', adminController.listContent);
router.post('/content/upload', handleUpload('image'), adminController.uploadContentImage);
router.get('/content/:key', adminController.getContent);
router.post('/content/:key', adminController.updateContent);
router.delete('/content/:key', adminController.deleteContent);

// Activity Routes
router.get('/activities', adminController.getRecentActivity);

module.exports = router;
