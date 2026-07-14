const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
      unique: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis details are required'],
      trim: true,
    },
    medicines: [
      {
        name: {
          type: String,
          required: [true, 'Medicine name is required'],
          trim: true,
        },
        dosage: {
          type: String,
          required: [true, 'Dosage instructions are required'], // e.g. "500mg" or "1 tablet"
          trim: true,
        },
        frequency: {
          type: String,
          required: [true, 'Frequency instruction is required'], // e.g. "Twice daily" or "Once a day after food"
          trim: true,
        },
        duration: {
          type: String,
          required: [true, 'Duration is required'], // e.g. "5 days" or "1 month"
          trim: true,
        }
      }
    ],
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    fileUrl: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
