const express = require('express');
const {
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  resetDoctorPassword,
  getAvailableDoctors,
  getDoctorById,
  getAllDoctors,
  updateOwnDoctorProfile,
  getBookedSlots,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public Access Endpoints
router.get('/doctors', getAvailableDoctors);
router.get('/doctors/:id', getDoctorById);
router.get('/doctors/:id/booked-slots', getBookedSlots);

// Doctor Secure Endpoints
router.put('/doctor/profile', protect, authorize('doctor'), updateOwnDoctorProfile);

// Administrative Secure Endpoints
router.post('/admin/doctors', protect, authorize('admin'), createDoctor);
router.get('/admin/doctors', protect, authorize('admin'), getAllDoctors);
router.put('/admin/doctors/:id', protect, authorize('admin'), updateDoctor);
router.patch('/admin/doctors/:id/status', protect, authorize('admin'), toggleDoctorStatus);
router.patch('/admin/doctors/:id/password', protect, authorize('admin'), resetDoctorPassword);

module.exports = router;
