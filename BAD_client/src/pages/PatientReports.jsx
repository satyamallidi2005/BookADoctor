import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Download, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  X 
} from 'lucide-react';

/**
 * Patient Medical Reports manager page.
 * Manages document uploads, listings, and deletions.
 */
const PatientReports = () => {
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete modal state
  const [deletingReport, setDeletingReport] = useState(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [reportsRes, appsRes] = await Promise.all([
        authService.getReports(),
        authService.getAppointments()
      ]);

      if (reportsRes.success && reportsRes.data) {
        setReports(reportsRes.data);
      } else {
        setUploadError(reportsRes.message || 'Failed to load reports.');
      }

      if (appsRes.success && appsRes.data) {
        setAppointments(appsRes.data);
      }
    } catch (err) {
      setUploadError(err.message || 'An error occurred while loading medical records.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    setSuccessMsg('');
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Size limit check: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      setSelectedFile(null);
      e.target.value = null; // Clear input
      return;
    }

    // Mimetype check
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Unsupported file type. Only PDF, JPEG, JPG, and PNG are allowed.');
      setSelectedFile(null);
      e.target.value = null;
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedAppointmentId) {
        formData.append('appointmentId', selectedAppointmentId);
      }

      const res = await authService.uploadReport(formData);
      if (res.success) {
        setSuccessMsg(`Report "${selectedFile.name}" uploaded successfully!`);
        setSelectedFile(null);
        setSelectedAppointmentId('');
        // Clear file input element
        const fileInput = document.getElementById('report-file-input');
        if (fileInput) fileInput.value = null;
        
        fetchInitialData();
      } else {
        setUploadError(res.message || 'Failed to upload report.');
      }
    } catch (err) {
      setUploadError(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (report) => {
    setDeletingReport(report);
  };

  const handleConfirmDelete = async () => {
    if (!deletingReport) return;
    setIsSubmittingDelete(true);
    try {
      const res = await authService.deleteReport(deletingReport._id);
      if (res.success) {
        setSuccessMsg(`Document "${deletingReport.fileName}" deleted successfully.`);
        setDeletingReport(null);
        fetchInitialData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete report.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Build full download URL
  const resolveDownloadUrl = (url) => {
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    return `${baseUrl}${url}`;
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (loading && reports.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading medical reports database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Medical Reports</h1>
        <p className="text-xs text-slate-400 font-medium">Keep your prescription files, lab results, and diagnostic scans archived securely.</p>
      </div>

      {/* Grid: Upload Box & List Box */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Upload Form Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-850 border-b border-slate-100 pb-2">
              Upload New Record
            </h3>

            {successMsg && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-150 text-emerald-850 p-3 rounded-xl text-xs font-bold">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 animate-bounce" />
                <span>{successMsg}</span>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-sm text-slate-650">
              
              {/* File Dropzone */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 rounded-2xl p-6 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  id="report-file-input"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="block text-xs font-bold text-slate-650 mt-2 text-center group-hover:text-slate-800">
                  {selectedFile ? selectedFile.name : 'Select PDF or Image'}
                </span>
                <span className="block text-[9px] text-slate-400 pt-1">
                  {selectedFile ? formatBytes(selectedFile.size) : 'Max file size 5MB'}
                </span>
              </div>

              {/* Appointment Option Link */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Link to Appointment (Optional)
                </label>
                <select
                  value={selectedAppointmentId}
                  onChange={(e) => setSelectedAppointmentId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-250 rounded-xl text-xs bg-white outline-none focus:border-blue-500"
                >
                  <option value="">General Archive (No link)</option>
                  {appointments.map((app) => (
                    <option key={app._id} value={app._id}>
                      {new Date(app.appointmentDate).toLocaleDateString()} - Dr. {app.doctorId?.name} ({app.status})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full font-bold text-xs py-2.5 mt-2"
                loading={isUploading}
                disabled={!selectedFile}
              >
                Upload File
              </Button>
            </form>
          </div>
        </div>

        {/* Reports Registry List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
              Archived Documents
            </h3>

            {reports.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No archived reports found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs text-slate-650">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">File Name</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Upload Date</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Linked Visit</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((report) => (
                      <tr key={report._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2 max-w-[180px] sm:max-w-xs truncate">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-bold text-slate-800 truncate" title={report.fileName}>
                              {report.fileName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 font-medium">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {report.appointmentId ? (
                            <span className="font-semibold text-slate-700">
                              Dr. {report.appointmentId.doctorId?.name || 'Practitioner'}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              General
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-1.5">
                          <a 
                            href={resolveDownloadUrl(report.fileUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Download Report"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDeleteClick(report)}
                            className="inline-flex p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal overlay */}
      {deletingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden text-sm text-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Confirm Report Deletion</h3>
              <button onClick={() => setDeletingReport(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-lg text-xs font-semibold">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>This action cannot be undone. The file will be deleted permanently.</span>
              </div>
              <p>
                Are you sure you want to delete medical report <strong>{deletingReport.fileName}</strong>?
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setDeletingReport(null)} className="px-4">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmDelete} 
                  variant="danger" 
                  size="sm" 
                  loading={isSubmittingDelete} 
                  className="px-6 font-bold"
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientReports;
