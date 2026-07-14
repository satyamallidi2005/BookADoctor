const reportService = require('../services/reportService');

/**
 * Upload a new medical report document.
 */
const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File payload is missing or file format is unsupported.',
        data: null,
      });
    }

    const { appointmentId } = req.body;
    const report = await reportService.uploadReport(req.user.id, req.file, appointmentId);

    return res.status(201).json({
      success: true,
      message: 'Medical report uploaded successfully.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reports registered under patient session.
 */
const getPatientReports = async (req, res, next) => {
  try {
    const reports = await reportService.getPatientReports(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Medical reports retrieved successfully.',
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a medical report record.
 */
const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    await reportService.deleteReport(req.user.id, id);
    return res.status(200).json({
      success: true,
      message: 'Medical report deleted successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadReport,
  getPatientReports,
  deleteReport,
};
