import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  ChevronRight,
  X
} from 'lucide-react';

/**
 * Past visits archives checker.
 * Displays completed and cancelled consultations history list.
 */
const DoctorHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Details sheet modal
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await authService.getDoctorAppointments();
      if (res.success && res.data) {
        // Filter completed and cancelled history records
        const past = res.data.filter(app => app.status === 'completed' || app.status === 'cancelled' || app.status === 'rejected');
        setHistory(past);
      } else {
        setError(res.message || 'Failed to load schedule history.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading database.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'rejected':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'cancelled':
        return 'bg-slate-105 text-slate-600 border border-slate-200';
      default:
        return 'bg-slate-50 text-slate-500';
    }
  };

  if (loading && history.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading history records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm text-slate-700 animate-fadeIn">
      {/* Subheader */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Appointment History</h1>
        <p className="text-xs text-slate-400 font-medium">Browse historical reports, cancelled bookings, and completed sessions.</p>
      </div>

      {error ? (
        <div className="text-center py-12 text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-xl p-4 max-w-md mx-auto text-sm">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 text-slate-500 text-sm">
          No records found in appointment history logs.
        </div>
      ) : (
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-slate-650">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Time Slot</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right font-bold text-slate-400 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((app) => {
                  const pat = app.patientId || {};
                  const patName = pat.name || 'Patient';
                  return (
                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100 shrink-0 overflow-hidden">
                            {pat.profileImage ? (
                              <img src={pat.profileImage} alt={patName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <span className="font-bold text-slate-800">{patName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-550 font-medium">
                        {new Date(app.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                        {app.appointmentTime}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedSession(app)}
                          className="inline-flex p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold"
                          title="View Case Sheet"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Case Details modal overlay */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden text-sm text-slate-700">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-slate-800">Appointment Record details</h3>
              <button onClick={() => setSelectedSession(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Patient details block */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden">
                  {selectedSession.patientId?.profileImage ? (
                    <img src={selectedSession.patientId.profileImage} alt={selectedSession.patientId?.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 leading-none">{selectedSession.patientId?.name}</h4>
                  <span className="block text-[10px] text-slate-450 pt-1.5 leading-none">Email: {selectedSession.patientId?.email}</span>
                </div>
              </div>

              {/* Booking params */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consultation Date</span>
                  <p className="font-bold text-slate-700">{new Date(selectedSession.appointmentDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</span>
                  <p className="font-bold text-slate-700">{selectedSession.appointmentTime}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(selectedSession.status)}`}>
                      {selectedSession.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consultation Fee</span>
                  <p className="font-bold text-slate-750">${selectedSession.consultationFee}</p>
                </div>
              </div>

              {/* Consultation description */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Purpose of Visit</span>
                <p className="italic text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 font-semibold">
                  "{selectedSession.reason}"
                </p>
              </div>

              {/* Symptoms */}
              {selectedSession.symptoms && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Symptoms Reported</span>
                  <p className="italic text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{selectedSession.symptoms}"
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedSession.status === 'completed' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Clinical Advice (Doctor Notes)</span>
                  <p className="text-slate-650 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed min-h-[60px]">
                    {selectedSession.doctorNotes || 'No prescription notes registered.'}
                  </p>
                </div>
              )}

              {/* Cancel Rejection reasons */}
              {(selectedSession.status === 'cancelled' || selectedSession.status === 'rejected') && (
                <div className="space-y-1 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl text-xs font-semibold">
                  <span className="block text-[10px] font-extrabold uppercase text-rose-600">Cancellation/Decline Logs</span>
                  <p className="pt-1.5 italic">
                    "{selectedSession.cancelReason || 'Cancelled by user.'}"
                    {selectedSession.cancelledBy && ` (By: ${selectedSession.cancelledBy})`}
                  </p>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setSelectedSession(null)} className="px-5 font-bold">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorHistory;
