import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { 
  Search, 
  Star, 
  Award, 
  MapPin, 
  DollarSign, 
  User, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

/**
 * Patient Appointment Booking page.
 * Displays doctor catalogs and hosts the slot reservation panel.
 */
const PatientBook = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctor');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected doctor for booking form swap
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Form states
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const loadBookedSlots = async () => {
      if (!bookingDate || !selectedDoctor) {
        setBookedSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await authService.getBookedSlots(selectedDoctor._id, bookingDate);
        if (res.success && res.data) {
          setBookedSlots(res.data);
        }
      } catch (err) {
        console.error('Failed to load booked slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadBookedSlots();
  }, [bookingDate, selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await authService.getAvailableDoctors();
      if (res.success && res.data) {
        setDoctors(res.data);
        if (preselectedDoctorId) {
          const doc = res.data.find(d => d._id === preselectedDoctorId);
          if (doc) {
            setSelectedDoctor(doc);
          }
        }
      } else {
        setFormError(res.message || 'Failed to retrieve available doctors.');
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred while loading specialists.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingDate('');
    setBookingSlot('');
    setReason('');
    setSymptoms('');
    setNotes('');
    setBookedSlots([]);
    setFormError('');
    setBookingSuccess(false);
  };

  const handleBackToList = () => {
    setSelectedDoctor(null);
  };

  // Helper to parse available days and generate valid upcoming date options (next 14 days)
  const getAvailableDates = (availableDays = []) => {
    const dates = [];
    const daysOfWeek = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
      sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
    };

    const dayNums = availableDays.map(d => {
      const cleaned = d.trim().toLowerCase();
      return daysOfWeek[cleaned] !== undefined ? daysOfWeek[cleaned] : -1;
    }).filter(n => n !== -1);

    if (dayNums.length === 0) return [];

    const current = new Date();
    // Look ahead 14 calendar days
    for (let i = 1; i <= 14; i++) {
      const temp = new Date();
      temp.setDate(current.getDate() + i);
      if (dayNums.includes(temp.getDay())) {
        dates.push(temp);
      }
    }
    return dates;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingSlot || !reason) {
      setFormError('Date, time slot, and reason for consultation are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    
    try {
      const payload = {
        doctorId: selectedDoctor._id,
        appointmentDate: bookingDate,
        appointmentTime: bookingSlot,
        reason,
        symptoms,
        notes,
      };

      const res = await authService.createAppointment(payload);
      if (res.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 2000);
      } else {
        setFormError(res.message || 'Failed to register appointment.');
      }
    } catch (err) {
      setFormError(err.message || 'Server error occurred during booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter doctors based on search queries
  const filteredDoctors = doctors.filter(doc => {
    const term = search.toLowerCase();
    const prof = doc.doctorProfile || {};
    return (
      doc.name.toLowerCase().includes(term) ||
      (prof.specialization && prof.specialization.toLowerCase().includes(term)) ||
      (prof.hospital && prof.hospital.toLowerCase().includes(term))
    );
  });

  if (loading && doctors.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading available doctors...</p>
      </div>
    );
  }

  // Render Booking Form Screen
  if (selectedDoctor) {
    const prof = selectedDoctor.doctorProfile || {};
    const docName = selectedDoctor.name.startsWith('Dr.') ? selectedDoctor.name : `Dr. ${selectedDoctor.name}`;
    const dateOptions = getAvailableDates(prof.availableDays);

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Back Link */}
        <button 
          onClick={handleBackToList}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Specialists List
        </button>

        {/* Booking Card */}
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
          {/* Header Summary */}
          <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100 shrink-0 overflow-hidden">
              {selectedDoctor.profileImage ? (
                <img src={selectedDoctor.profileImage} alt={docName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-tight">{docName}</h2>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide pt-0.5">{prof.specialization || 'Medical Specialist'}</p>
              <p className="text-[11px] text-slate-400 font-semibold pt-1">{prof.hospital}</p>
            </div>
          </div>

          {/* Form */}
          {bookingSuccess ? (
            <div className="p-10 text-center space-y-3 flex flex-col items-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
              <h3 className="text-lg font-extrabold text-slate-800">Booking Confirmed!</h3>
              <p className="text-sm text-slate-500 max-w-xs">
                Your appointment request has been submitted. Redirecting to your appointments list...
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-5 text-sm text-slate-700">
              {formError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-lg text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Consultation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Available Dates */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-550 uppercase flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" /> 1. Select Consult Date *
                  </label>
                  <select
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white outline-none focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Choose a calendar date</option>
                    {dateOptions.map((date) => (
                      <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Available Slots */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-555 uppercase flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" /> 2. Select Time Slot *
                  </label>
                  
                  {!bookingDate ? (
                    <div className="px-4 py-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 italic">
                      Please select a consultation date first to check doctor hours.
                    </div>
                  ) : loadingSlots ? (
                    <div className="text-xs text-slate-450 italic py-2">
                      Checking slot availability schedules...
                    </div>
                  ) : !prof.availableSlots || prof.availableSlots.length === 0 ? (
                    <div className="px-4 py-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-450 italic">
                      No time slots configured by practitioner for this day.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {prof.availableSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = bookingSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setBookingSlot(slot)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center min-h-[38px]
                              ${isBooked 
                                ? 'bg-red-50 text-red-500 border-red-200 cursor-not-allowed' 
                                : isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-350'}`}
                          >
                            {slot} {isBooked && ' (Occupied)'}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Reason input */}
              <Input
                label="Reason for Consultation *"
                placeholder="e.g. Regular health checkup, follow-up consult"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />

              {/* Symptoms input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Symptoms Reported (Optional)</label>
                <textarea
                  placeholder="Describe any symptoms you are experiencing (e.g. fever, sore throat, cough)"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500 min-h-[60px]"
                />
              </div>

              {/* Notes input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Additional Notes (Optional)</label>
                <textarea
                  placeholder="Any extra history, files, or information you want to share with the doctor"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500 min-h-[100px]"
                />
              </div>

              {/* Consultation Fee Alert */}
              <div className="bg-blue-50 border border-blue-150 p-4 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-700">Due at Hospital Registration:</span>
                </div>
                <span className="text-sm font-black text-blue-700">${prof.consultationFee}</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="secondary" size="md" type="button" onClick={handleBackToList} className="px-5">
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" loading={isSubmitting} className="px-8 font-bold">
                  Confirm Appointment
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Render Doctor Listing Screen
  return (
    <div className="space-y-6">
      {/* Subheader Title */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Book an Appointment</h1>
        <p className="text-xs text-slate-400">Search and schedule clinical consultation slots with verified medical practitioners.</p>
      </div>

      {/* Search Input bar */}
      <div className="relative max-w-md w-full bg-white rounded-xl border border-slate-150 p-2 shadow-xs">
        <Search className="absolute left-4 top-4.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by doctor name, specialty, or clinic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 text-slate-500 text-sm">
          No medical specialists found matching the filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredDoctors.map((doc) => {
            const prof = doc.doctorProfile || {};
            const docName = doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`;
            return (
              <div key={doc._id} className="bg-white border border-slate-150 rounded-2xl shadow-xs p-5 flex flex-col justify-between hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="space-y-4">
                  {/* Doctor Avatar */}
                  <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border border-blue-50 bg-blue-50/50 flex items-center justify-center">
                    {doc.profileImage ? (
                      <img src={doc.profileImage} alt={docName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-blue-400" />
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="text-center space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">{docName}</h3>
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">{prof.specialization || 'Specialist'}</p>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-amber-500 pt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                      <span className="font-bold text-slate-700">{prof.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-slate-400">({prof.totalReviews || 0} reviews)</span>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Profile parameters */}
                  <div className="space-y-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><span className="font-semibold text-slate-700">Experience:</span> {prof.experience || 0} Years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate"><span className="font-semibold text-slate-700">Hospital:</span> {prof.hospital}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><span className="font-semibold text-slate-700">Fee:</span> ${prof.consultationFee}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Trigger */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-bold py-2 shadow-xs"
                    onClick={() => handleStartBooking(doc)}
                  >
                    Book Appointment
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientBook;
