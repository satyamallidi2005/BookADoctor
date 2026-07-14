import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  MapPin, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  PlusCircle,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Patient Appointments list overview page.
 * Manages upcoming, pending, completed, and cancelled consultation cards.
 */
const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab states: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
  const [activeTab, setActiveTab] = useState('all');

  // Cancel action state
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Detail Modal state
  const [detailedAppointment, setDetailedAppointment] = useState(null);

  // Review Modal state
  const [reviewingAppointment, setReviewingAppointment] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewClick = (appointment) => {
    setReviewingAppointment(appointment);
    setRatingValue(5);
    setReviewText('');
  };

  const handleConfirmReview = async () => {
    if (!reviewingAppointment) return;
    setIsSubmittingReview(true);
    try {
      const res = await authService.submitReview(reviewingAppointment._id, {
        rating: ratingValue,
        review: reviewText,
      });
      if (res.success) {
        fetchAppointments();
        setReviewingAppointment(null);
        // Sync open detailed modal if needed
        if (detailedAppointment && detailedAppointment._id === reviewingAppointment._id) {
          setDetailedAppointment({
            ...detailedAppointment,
            rating: ratingValue,
            review: reviewText,
          });
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await authService.getAppointments();
      if (res.success && res.data) {
        setAppointments(res.data);
      } else {
        setError(res.message || 'Failed to retrieve appointments list.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (appointment) => {
    setCancellingAppointment(appointment);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;
    setIsSubmittingCancel(true);
    try {
      const res = await authService.cancelAppointment(cancellingAppointment._id);
      if (res.success) {
        fetchAppointments();
        setCancellingAppointment(null);
        // If the cancelled appointment is also currently open in details modal, refresh it
        if (detailedAppointment && detailedAppointment._id === cancellingAppointment._id) {
          setDetailedAppointment({ ...detailedAppointment, status: 'cancelled' });
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment. Please try again.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleViewDetails = (appointment) => {
    setDetailedAppointment(appointment);
  };

  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'cancelled':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">My Appointments</h1>
          <p className="text-xs text-slate-400">Keep track of your upcoming slots and review past clinical visits history.</p>
        </div>
        <Link to="/patient/book">
          <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-sm font-bold">
            <PlusCircle className="w-4 h-4" /> Book Appointment
          </Button>
        </Link>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-150 pb-px">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold capitalize transition-all border-b-2 -mb-px shrink-0
              ${activeTab === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-450 hover:text-slate-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List Container */}
      {error ? (
        <div className="text-center py-12 text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-xl p-4 max-w-md mx-auto">
          {error}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 text-slate-500 text-sm">
          No appointments found matching this status filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredAppointments.map((app) => {
            const doc = app.doctorId || {};
            const prof = doc.doctorProfile || {};
            const docName = doc.name?.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`;
            
            return (
              <div key={app._id} className="bg-white border border-slate-150 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
                <div className="space-y-4">
                  {/* Doctor Info Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 overflow-hidden">
                        {doc.profileImage ? (
                          <img src={doc.profileImage} alt={docName} className="w-full h-full object-cover" />
                        ) : (
                          <Stethoscope className="w-5 h-5 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 leading-tight">{docName}</h3>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide pt-0.5 block">
                          {prof.specialization || 'Specialist'}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeClass(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Date Time info */}
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
                    <p className="text-slate-600 line-clamp-1 italic">"{app.reason}"</p>
                  </div>

                  {app.rating && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 pt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{app.rating}/5 Rated</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4 shrink-0">
                  <button 
                    onClick={() => handleViewDetails(app)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  {(app.status === 'pending' || app.status === 'confirmed') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCancelClick(app)}
                      className="text-xs border-slate-200 text-rose-600 hover:bg-rose-50 font-bold px-3 py-1.5 hover:border-rose-100"
                    >
                      Cancel Visit
                    </Button>
                  )}

                  {app.status === 'completed' && !app.rating && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReviewClick(app)}
                      className="text-xs border-slate-200 text-blue-650 hover:bg-blue-50 font-bold px-3 py-1.5 hover:border-blue-100"
                    >
                      Rate & Review
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Appointment Detail Modal overlay */}
      {detailedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full overflow-hidden text-sm text-slate-700 mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-slate-800">Appointment Record Sheet</h3>
              <button onClick={() => setDetailedAppointment(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content info */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Doctor Details */}
              <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 overflow-hidden">
                  {detailedAppointment.doctorId?.profileImage ? (
                    <img src={detailedAppointment.doctorId.profileImage} alt={detailedAppointment.doctorId?.name} className="w-full h-full object-cover" />
                  ) : (
                    <Stethoscope className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Dr. {detailedAppointment.doctorId?.name}</h4>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{detailedAppointment.doctorId?.doctorProfile?.specialization || 'Specialist'}</p>
                  <p className="text-[10px] text-slate-400 pt-0.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {detailedAppointment.doctorId?.doctorProfile?.hospital}</p>
                </div>
              </div>

              {/* Consultation timing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consult Date</span>
                  <p className="font-bold text-slate-700">{new Date(detailedAppointment.appointmentDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consult Time Slot</span>
                  <p className="font-bold text-slate-700">{detailedAppointment.appointmentTime}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Booking Status</span>
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeClass(detailedAppointment.status)}`}>
                      {detailedAppointment.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Hospital Charge</span>
                  <p className="font-bold text-slate-700">${detailedAppointment.doctorId?.doctorProfile?.consultationFee || 0}</p>
                </div>
              </div>

              {/* Reasons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Symptom Description</span>
                <p className="text-slate-650 bg-slate-50 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                  "{detailedAppointment.reason}"
                </p>
              </div>

              {/* Prescription / Clinical Notes */}
              {detailedAppointment.status === 'completed' && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Doctor's Clinical Notes</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed min-h-[60px]">
                      {detailedAppointment.doctorNotes || 'No notes written.'}
                    </p>
                  </div>

                  {detailedAppointment.prescriptionId && (
                    <div className="border border-slate-150 p-4 rounded-2xl space-y-3 bg-white shadow-xs">
                      <span className="block text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                        📋 Prescription Record
                      </span>
                      <div className="text-xs space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Diagnosis</span>
                        <p className="font-semibold text-slate-750">{detailedAppointment.prescriptionId.diagnosis}</p>
                      </div>

                      {detailedAppointment.prescriptionId.medicines?.length > 0 && (
                        <div className="overflow-x-auto pt-2 border-t border-slate-100">
                          <table className="min-w-full divide-y divide-slate-100 text-xs text-slate-650">
                            <thead>
                              <tr>
                                <th className="pb-2 text-left font-bold text-slate-400 uppercase">Medicine</th>
                                <th className="pb-2 text-left font-bold text-slate-400 uppercase">Dosage</th>
                                <th className="pb-2 text-left font-bold text-slate-400 uppercase">Frequency</th>
                                <th className="pb-2 text-left font-bold text-slate-400 uppercase">Duration</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {detailedAppointment.prescriptionId.medicines.map((med, index) => (
                                <tr key={index}>
                                  <td className="py-2 font-bold text-slate-800">{med.name}</td>
                                  <td className="py-2 text-slate-600">{med.dosage}</td>
                                  <td className="py-2 text-slate-600">{med.frequency}</td>
                                  <td className="py-2 text-slate-650">{med.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {detailedAppointment.prescriptionId.followUpDate && (
                        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                          Follow-up Date: <span className="text-slate-700 font-semibold">{new Date(detailedAppointment.prescriptionId.followUpDate).toLocaleDateString()}</span>
                        </div>
                      )}
                </div> )}
                  {detailedAppointment.rating && (
                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Your Consultation Review</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= detailedAppointment.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} 
                          />
                        ))}
                        <span className="text-slate-650 text-xs font-semibold pl-1.5">({detailedAppointment.rating} / 5)</span>
                      </div>
                      {detailedAppointment.review && (
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                          "{detailedAppointment.review}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Cancel Rejection reasons */}
              {(detailedAppointment.status === 'cancelled' || detailedAppointment.status === 'rejected') && (
                <div className="space-y-1 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl text-xs font-semibold">
                  <span className="block text-[10px] font-extrabold uppercase text-rose-600">Cancellation/Decline Logs</span>
                  <p className="pt-1.5 italic">
                    "{detailedAppointment.cancelReason || 'Cancelled by user.'}"
                    {detailedAppointment.cancelledBy && ` (By: ${detailedAppointment.cancelledBy})`}
                  </p>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setDetailedAppointment(null)} className="px-5 font-bold">
                Close Sheet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation confirmation modal */}
      {cancellingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden text-sm text-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Confirm Cancellation</h3>
              <button onClick={() => setCancellingAppointment(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-lg text-xs font-semibold">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>Cancelling will release your reserved consultation time slot.</span>
              </div>
              <p>
                Are you sure you want to cancel your consultation booking with{' '}
                <strong>Dr. {cancellingAppointment.doctorId?.name}</strong> on{' '}
                {new Date(cancellingAppointment.appointmentDate).toLocaleDateString()}?
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setCancellingAppointment(null)} className="px-4">
                  Back
                </Button>
                <Button 
                  onClick={handleConfirmCancel} 
                  variant="danger" 
                  size="sm" 
                  loading={isSubmittingCancel} 
                  className="px-6 font-bold"
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Review & Rating Modal */}
      {reviewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden text-sm text-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Rate & Review Consultation</h3>
              <button onClick={() => setReviewingAppointment(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Consultation with</p>
                <h4 className="font-extrabold text-slate-800 text-base">Dr. {reviewingAppointment.doctorId?.name}</h4>
                <p className="text-xs text-slate-500">{reviewingAppointment.doctorId?.doctorProfile?.specialization || 'Medical Specialist'}</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">1. Rate your Consultation</label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingValue(star)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= ratingValue 
                            ? 'fill-amber-500 text-amber-500' 
                            : 'text-slate-200 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase">2. Write your Review (Optional)</label>
                <textarea
                  placeholder="Share your experience with the practitioner to help other patients..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white outline-none focus:border-blue-500 min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setReviewingAppointment(null)} className="px-4">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmReview} 
                  variant="primary" 
                  size="sm" 
                  loading={isSubmittingReview} 
                  className="px-6 font-bold"
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
