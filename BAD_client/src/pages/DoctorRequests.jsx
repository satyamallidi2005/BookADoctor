import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import { 
  User, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  AlertTriangle
} from 'lucide-react';

/**
 * Doctor incoming requests responder.
 * Manages list of pending bookings, accept actions, and reject logs.
 */
const DoctorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reject overlays states
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Accept loading state for individual items
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await authService.getDoctorAppointments();
      if (res.success && res.data) {
        // Filter only pending requests
        const pending = res.data.filter(app => app.status === 'pending');
        setRequests(pending);
      } else {
        setError(res.message || 'Failed to retrieve pending appointments.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      const res = await authService.acceptAppointment(id);
      if (res.success) {
        // Refresh local items
        setRequests(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to accept appointment.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReject = (request) => {
    setRejectingRequest(request);
    setRejectReason('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason) return;
    setIsSubmittingReject(true);

    try {
      const res = await authService.rejectAppointment(rejectingRequest._id, rejectReason);
      if (res.success) {
        setRequests(prev => prev.filter(r => r._id !== rejectingRequest._id));
        setRejectingRequest(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to reject appointment.');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading pending requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm text-slate-700 animate-fadeIn">
      {/* Subheader */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Appointment Requests</h1>
        <p className="text-xs text-slate-400 font-medium">Respond to patients requesting consultation slots.</p>
      </div>

      {error ? (
        <div className="text-center py-12 text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-xl p-4 max-w-md mx-auto">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 text-slate-500 text-sm">
          No pending appointment requests.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {requests.map((app) => {
            const pat = app.patientId || {};
            const patName = pat.name || 'Patient';
            return (
              <div key={app._id} className="bg-white border border-slate-150 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
                <div className="space-y-4">
                  {/* Patient Info Row */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 overflow-hidden">
                      {pat.profileImage ? (
                        <img src={pat.profileImage} alt={patName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{patName}</h3>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide pt-0.5 block">
                        Gender: <strong className="text-slate-655 font-bold">{pat.gender || 'Not specified'}</strong>
                      </span>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Booking Date Time */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-650 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Date</span>
                      <p className="font-bold text-slate-700">{new Date(app.appointmentDate).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Slot Time</span>
                      <p className="font-bold text-slate-700 truncate">{app.appointmentTime}</p>
                    </div>
                  </div>

                  {/* Consultation reasons */}
                  <div className="text-xs space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Reason for Consultation</span>
                    <p className="text-slate-600 italic">"{app.reason}"</p>
                  </div>

                  {/* Symptoms */}
                  {app.symptoms && (
                    <div className="text-xs space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Symptoms Reported</span>
                      <p className="text-slate-600 italic">"{app.symptoms}"</p>
                    </div>
                  )}
                </div>

                {/* Accept Reject Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-4 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-grow text-xs font-bold py-2 flex items-center justify-center gap-1"
                    onClick={() => handleAccept(app._id)}
                    loading={processingId === app._id}
                    disabled={processingId !== null}
                  >
                    <Check className="w-4 h-4" /> Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-grow text-xs font-bold py-2 border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-100 flex items-center justify-center gap-1"
                    onClick={() => handleOpenReject(app)}
                    disabled={processingId !== null}
                  >
                    <X className="w-4 h-4" /> Decline
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Consultation Reason modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden text-sm text-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Decline Appointment</h3>
              <button onClick={() => setRejectingRequest(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject}>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-150 text-rose-850 p-3 rounded-lg text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Please provide a reason to notify patient.</span>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Reason for decline *</label>
                  <textarea
                    placeholder="e.g. Schedule conflict, out of clinic today, please select another slot."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500 min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setRejectingRequest(null)} className="px-4">
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="danger" 
                    size="sm" 
                    loading={isSubmittingReject} 
                    className="px-6 font-bold"
                  >
                    Confirm Decline
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRequests;
