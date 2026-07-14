const express = require('express');
const {
  uploadReport,
  getPatientReports,
  deleteReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Restrict all report paths to patients
router.use(protect);
router.use(authorize('patient'));

router.post('/reports', upload.single('file'), uploadReport);
router.get('/reports', getPatientReports);
router.delete('/reports/:id', deleteReport);

module.exports = router;
