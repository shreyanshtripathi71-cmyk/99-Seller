const express = require('express');
const router = express.Router();
const savedPropertyController = require('../controllers/savedPropertyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', savedPropertyController.saveProperty);
router.get('/', savedPropertyController.getSavedProperties);
router.delete('/:id', savedPropertyController.removeSavedProperty);

module.exports = router;
