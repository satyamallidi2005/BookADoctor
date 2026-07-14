const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Prescription = require('../models/Prescription');
const mongoose = require('mongoose');

/**
 * Creates a new Appointment for a patient.
 * Also registers notifications for both patient and doctor.
 */
const createAppointment = async (patientId, data) => {
  const { doctorId, appointmentDate, appointmentTime, reason, symptoms, notes } = data;

  const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true })
    .populate('doctorProfile');
  if (!doctor || !doctor.doctorProfile) {
    throw new Error('Doctor profile not found or doctor is currently inactive.');
  }

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    appointmentDate,
    appointmentTime,
    reason,
    symptoms: symptoms || '',
    notes: notes || '',
    consultationFee: doctor.doctorProfile.consultationFee || 0,
    status: 'pending',
  });

  // Notify Patient
  await Notification.create({
    receiverId: patientId,
    title: 'Appointment Booked',
    message: `Your appointment with Dr. ${doctor.name} is booked for ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime} (Pending Confirmation).`,
    type: 'appointment',
  });

  // Notify Doctor
  await Notification.create({
    receiverId: doctorId,
    title: 'New Appointment Request',
    message: `You have received a new appointment booking request (Pending Confirmation).`,
    type: 'appointment',
  });

  return appointment;
};

/**
 * Retrieves all appointments for the logged-in patient.
 */
const getPatientAppointments = async (patientId) => {
  return await Appointment.find({ patientId })
    .populate({
      path: 'doctorId',
      select: 'name email profileImage',
      populate: {
        path: 'doctorProfile',
        select: 'specialization hospital qualification',
      },
    })
    .populate('prescriptionId')
    .sort({ appointmentDate: -1 });
};

/**
 * Retrieves all appointments assigned to the logged-in doctor.
 */
const getDoctorAppointments = async (doctorId) => {
  return await Appointment.find({ doctorId })
    .populate('patientId', 'name email phone gender profileImage')
    .sort({ appointmentDate: -1 });
};

/**
 * Retrieves a single appointment detail by ID, checking role-based boundaries.
 */
const getAppointmentById = async (userId, role, id) => {
  let query = { _id: id };
  if (role === 'patient') {
    query.patientId = userId;
  } else if (role === 'doctor') {
    query.doctorId = userId;
  }

  const appointment = await Appointment.findOne(query)
    .populate('patientId', 'name email phone gender profileImage')
    .populate({
      path: 'doctorId',
      select: 'name email profileImage phone gender',
      populate: {
        path: 'doctorProfile',
      },
    })
    .populate('prescriptionId');

  if (!appointment) {
    throw new Error('Appointment not found or unauthorized access.');
  }

  return appointment;
};

/**
 * Cancels a pending or confirmed appointment.
 */
const cancelAppointment = async (userId, role, id, cancelReason = '') => {
  let query = { _id: id };
  if (role === 'patient') {
    query.patientId = userId;
  } else if (role === 'doctor') {
    query.doctorId = userId;
  }

  const appointment = await Appointment.findOne(query);
  if (!appointment) {
    throw new Error('Appointment not found or unauthorized.');
  }

  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    throw new Error(`Appointment cannot be cancelled because it is already ${appointment.status}.`);
  }

  appointment.status = 'cancelled';
  appointment.cancelledBy = role;
  appointment.cancelReason = cancelReason || 'Cancelled by user';
  await appointment.save();

  const doctor = await User.findById(appointment.doctorId);
  const patient = await User.findById(appointment.patientId);

  const docName = doctor ? doctor.name : 'your doctor';
  const patName = patient ? patient.name : 'patient';

  // Notify Patient
  await Notification.create({
    receiverId: appointment.patientId,
    title: 'Appointment Cancelled',
    message: `Appointment with Dr. ${docName} on ${new Date(appointment.appointmentDate).toLocaleDateString()} has been cancelled.`,
    type: 'appointment',
  });

  // Notify Doctor
  await Notification.create({
    receiverId: appointment.doctorId,
    title: 'Appointment Cancelled',
    message: `Patient ${patName} has cancelled the appointment booked for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}.`,
    type: 'appointment',
  });

  return appointment;
};

/**
 * Doctor: Accepts an appointment request.
 */
const acceptAppointment = async (doctorId, id) => {
  const appointment = await Appointment.findOne({ _id: id, doctorId });
  if (!appointment) {
    throw new Error('Appointment request not found.');
  }

  if (appointment.status !== 'pending') {
    throw new Error(`Appointment cannot be accepted from status: ${appointment.status}`);
  }

  appointment.status = 'accepted';
  await appointment.save();

  const doctor = await User.findById(doctorId);
  const docName = doctor ? doctor.name : 'Doctor';

  // Notify Patient
  await Notification.create({
    receiverId: appointment.patientId,
    title: 'Appointment Confirmed',
    message: `Dr. ${docName} has accepted your appointment request for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}.`,
    type: 'appointment',
  });

  return appointment;
};

/**
 * Doctor: Rejects an appointment request.
 */
const rejectAppointment = async (doctorId, id, rejectReason) => {
  const appointment = await Appointment.findOne({ _id: id, doctorId });
  if (!appointment) {
    throw new Error('Appointment request not found.');
  }

  if (appointment.status !== 'pending') {
    throw new Error(`Appointment cannot be rejected from status: ${appointment.status}`);
  }

  appointment.status = 'rejected';
  appointment.cancelReason = rejectReason || 'Rejected by Doctor';
  await appointment.save();

  const doctor = await User.findById(doctorId);
  const docName = doctor ? doctor.name : 'Doctor';

  // Notify Patient
  await Notification.create({
    receiverId: appointment.patientId,
    title: 'Appointment Rejected',
    message: `Dr. ${docName} has declined your appointment request. Reason: ${appointment.cancelReason}`,
    type: 'appointment',
  });

  return appointment;
};

/**
 * Doctor: Completes appointment, writes diagnosis/notes, creates Prescription inside a session transaction.
 */
const completeAppointment = async (doctorId, id, prescriptionData) => {
  const appointment = await Appointment.findOne({ _id: id, doctorId });
  if (!appointment) {
    throw new Error('Appointment not found.');
  }

  if (appointment.status !== 'accepted') {
    throw new Error(`Appointment cannot be completed from status: ${appointment.status}. Needs to be accepted first.`);
  }

  const { diagnosis, medicines, notes, followUpDate, fileUrl } = prescriptionData;
  if (!diagnosis) {
    throw new Error('Diagnosis details are required to complete consultation.');
  }

  let session = null;
  const useTransaction = !!mongoose.supportsTransactions;
  let prescription;
  
  if (useTransaction) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (err) {
      if (session) {
        session.endSession();
        session = null;
      }
    }
  }
  
  try {
    const sessionOption = useTransaction ? { session } : {};

    // 1. Create Prescription record
    const createdPrescription = await Prescription.create(
      [
        {
          appointmentId: id,
          patientId: appointment.patientId,
          doctorId,
          diagnosis,
          medicines: medicines || [],
          notes: notes || '',
          followUpDate: followUpDate || null,
          fileUrl: fileUrl || '',
        }
      ],
      sessionOption
    );
    prescription = createdPrescription[0];

    // 2. Complete appointment and link prescriptionId
    appointment.status = 'completed';
    appointment.doctorNotes = notes || '';
    appointment.prescriptionId = prescription._id;
    await appointment.save(sessionOption);

    if (useTransaction && session) {
      await session.commitTransaction();
    }
  } catch (err) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  const doctor = await User.findById(doctorId);
  const docName = doctor ? doctor.name : 'Doctor';

  // Notify Patient
  await Notification.create({
    receiverId: appointment.patientId,
    title: 'Appointment Completed',
    message: `Dr. ${docName} has completed your clinical visit. You can now download the prescription.`,
    type: 'appointment',
  });

  return appointment;
};

/**
 * Doctor: View previous appointments history of the same patient.
 */
const getPatientHistoryForDoctor = async (doctorId, patientId) => {
  // Check if they had at least one reservation link together to authorize privacy bounds
  const hasLink = await Appointment.exists({ doctorId, patientId });
  if (!hasLink) {
    throw new Error('Unauthorized view: You must have a registered appointment link with this patient to view their records.');
  }

  return await Appointment.find({ patientId })
    .populate('doctorId', 'name email')
    .populate('prescriptionId')
    .sort({ appointmentDate: -1 });
};

/**
 * Admin: View all appointments across all roles.
 */
const getAllAppointmentsAdmin = async (search = '', filterStatus = '', date = '') => {
  let query = {};
  if (filterStatus) {
    query.status = filterStatus;
  }
  if (date) {
    query.appointmentDate = new Date(date);
  }

  let appointments = await Appointment.find(query)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email')
    .sort({ appointmentDate: -1 });

  if (search) {
    const term = search.toLowerCase();
    appointments = appointments.filter(app => 
      (app.patientId && app.patientId.name.toLowerCase().includes(term)) ||
      (app.doctorId && app.doctorId.name.toLowerCase().includes(term)) ||
      app.reason.toLowerCase().includes(term)
    );
  }

  return appointments;
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
};
