const appointmentService = require('../services/appointmentService');

/**
 * Patient: Create a new Appointment.
 */
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, appointment date, time slot, and reason are required.',
        data: null,
      });
    }

    const appointment = await appointmentService.createAppointment(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Patient: Get all appointments for the authenticated patient.
 */
const getPatientAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getPatientAppointments(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Patient appointments retrieved successfully.',
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor: Get all appointments assigned to the logged-in doctor.
 */
const getDoctorAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getDoctorAppointments(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Doctor schedule retrieved successfully.',
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * General: Get single appointment details by ID (authenticated patient, doctor, or admin).
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(req.user.id, req.user.role, id);
    return res.status(200).json({
      success: true,
      message: 'Appointment loaded successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Patient / Doctor: Cancel an appointment booking.
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const appointment = await appointmentService.cancelAppointment(req.user.id, req.user.role, id, cancelReason);
    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor: Accept an appointment request.
 */
const acceptAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.acceptAppointment(req.user.id, id);
    return res.status(200).json({
      success: true,
      message: 'Appointment request confirmed.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor: Reject an appointment request.
 */
const rejectAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectReason } = req.body;

    if (!rejectReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required.',
        data: null,
      });
    }

    const appointment = await appointmentService.rejectAppointment(req.user.id, id, rejectReason);
    return res.status(200).json({
      success: true,
      message: 'Appointment request rejected.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor: Complete the appointment and issue prescription.
 */
const completeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.completeAppointment(req.user.id, id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Consultation completed and prescription registered.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor: View previous appointments history of the same patient.
 */
const getPatientHistoryForDoctor = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const history = await appointmentService.getPatientHistoryForDoctor(req.user.id, patientId);
    return res.status(200).json({
      success: true,
      message: 'Patient history logs retrieved.',
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: View all appointments across all roles.
 */
const getAllAppointmentsAdmin = async (req, res, next) => {
  try {
    const { search, status, date } = req.query;
    const appointments = await appointmentService.getAllAppointmentsAdmin(search, status, date);
    return res.status(200).json({
      success: true,
      message: 'All appointments loaded successfully.',
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Patient: Submits a review and rating score (1-5) for a completed appointment.
 */
const submitAppointmentReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating score is required and must be between 1 and 5.',
        data: null,
      });
    }

    const Appointment = require('../models/Appointment');
    const DoctorProfile = require('../models/DoctorProfile');

    const appointment = await Appointment.findOne({ _id: id, patientId: req.user.id });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment record not found or unauthorized access.',
        data: null,
      });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed consultations can be rated and reviewed.',
        data: null,
      });
    }

    appointment.rating = Number(rating);
    appointment.review = review || '';
    await appointment.save();

    // Recalculate average rating and totalReviews for this doctor
    const reviewsList = await Appointment.find({
      doctorId: appointment.doctorId,
      status: 'completed',
      rating: { $exists: true, $ne: null }
    });

    const totalReviews = reviewsList.length;
    const sumRating = reviewsList.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

    await DoctorProfile.findOneAndUpdate(
      { userId: appointment.doctorId },
      { rating: averageRating, totalReviews }
    );

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your feedback has been submitted.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
