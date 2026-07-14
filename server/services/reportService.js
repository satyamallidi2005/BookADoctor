const fs = require('fs');
const path = require('path');
const MedicalReport = require('../models/MedicalReport');
const Notification = require('../models/Notification');

/**
 * Creates a MedicalReport record and files it.
 */
const uploadReport = async (patientId, fileData, appointmentId) => {
  const report = await MedicalReport.create({
    patientId,
    appointmentId: appointmentId || null,
    fileName: fileData.originalname,
    fileUrl: `/uploads/${fileData.filename}`,
    fileType: fileData.mimetype,
    uploadedAt: new Date(),
  });

  // Notify Patient
  await Notification.create({
    receiverId: patientId,
    title: 'Report Uploaded',
    message: `Your medical report "${fileData.originalname}" has been successfully uploaded.`,
    type: 'report',
  });

  return report;
};

/**
 * Lists all medical reports uploaded by/for a patient.
 */
const getPatientReports = async (patientId) => {
  return await MedicalReport.find({ patientId })
    .populate('appointmentId')
    .sort({ createdAt: -1 });
};

/**
 * Deletes a medical report and removes its associated file from local disk space.
 */
const deleteReport = async (patientId, id) => {
  const report = await MedicalReport.findOne({ _id: id, patientId });
  if (!report) {
    throw new Error('Medical report not found.');
  }

  // Delete local file from disk space
  if (report.fileUrl) {
    const filename = report.fileUrl.split('/uploads/')[1];
    if (filename) {
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Error deleting file: ${filePath}, error: ${err.message}`);
        }
      }
    }
  }

  await MedicalReport.findByIdAndDelete(id);

  // Notify Patient
  await Notification.create({
    receiverId: patientId,
    title: 'Report Deleted',
    message: `Medical report "${report.fileName}" was removed from your records.`,
    type: 'report',
  });

  return { success: true };
};

module.exports = {
  uploadReport,
  getPatientReports,
  deleteReport,
};
