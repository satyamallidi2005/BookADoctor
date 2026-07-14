const express = require('express');
const { createDoctor, listDoctors } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authorization and protection middleware to all admin doctor endpoints
router.use(protect);
router.use(authorize('admin'));

router.post('/doctors', createDoctor);
router.get('/doctors', listDoctors);

module.exports = router;
