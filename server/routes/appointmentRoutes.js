const express = require('express');
const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  acceptAppointment,
  rejectAppointment,
  completeAppointment,
  getPatientHistoryForDoctor,
  getAllAppointmentsAdmin,
  submitAppointmentReview,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply global authentication block to all appointment routes
router.use(protect);

// 1. Admin-only routes
router.get('/appointments/admin', authorize('admin'), getAllAppointmentsAdmin);

// 2. Doctor-only routes
router.get('/appointments/doctor', authorize('doctor'), getDoctorAppointments);
router.get('/appointments/patient/:patientId', authorize('doctor'), getPatientHistoryForDoctor);
router.patch('/appointments/:id/accept', authorize('doctor'), acceptAppointment);
router.patch('/appointments/:id/reject', authorize('doctor'), rejectAppointment);
router.post('/appointments/:id/complete', authorize('doctor'), completeAppointment);

// 3. Patient-only routes
router.post('/appointments', authorize('patient'), createAppointment);
router.get('/appointments', authorize('patient'), getPatientAppointments);
router.post('/appointments/:id/review', authorize('patient'), submitAppointmentReview);

// 4. Shared routes (Patients and Doctors)
router.get('/appointments/:id', authorize('patient', 'doctor', 'admin'), getAppointmentById);
router.patch('/appointments/:id/cancel', authorize('patient', 'doctor'), cancelAppointment);

module.exports = router;
