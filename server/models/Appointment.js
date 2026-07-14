const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID reference is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID reference is required'],
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
      index: true,
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time slot is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        message: 'Status must be pending, accepted, rejected, completed, or cancelled',
      },
      default: 'pending',
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      trim: true,
    },
    symptoms: {
      type: String,
      default: '',
      trim: true,
    },
    doctorNotes: {
      type: String,
      default: '',
      trim: true,
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      default: null,
    },
    medicalReportIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'MedicalReport',
      default: [],
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    appointmentType: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', null],
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: null,
    },
    review: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
