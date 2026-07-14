import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import ClockPicker from '../components/common/ClockPicker';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

/**
 * Doctor availability scheduler page.
 * Manages active days and session time slots.
 */
const DoctorAvailability = () => {
  const { user, setUser } = useAuth();
  const prof = user?.doctorProfile || {};

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [availableDays, setAvailableDays] = useState(prof.availableDays || []);
  const [availableSlots, setAvailableSlots] = useState(prof.availableSlots || []);
  
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync profile details when user state loads asynchronously
  useEffect(() => {
    if (user?.doctorProfile) {
      setAvailableDays(user.doctorProfile.availableDays || []);
      setAvailableSlots(user.doctorProfile.availableSlots || []);
    }
  }, [user]);

  const handleDayToggle = (day) => {
    setErrorMsg('');
    setSuccessMsg('');
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const formatTime12h = (time24) => {
    if (!time24) return '';
    const [hourStr, minStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    const formattedHour = hour < 10 ? `0${hour}` : hour;
    return `${formattedHour}:${minStr} ${ampm}`;
  };

  const handleAddSlot = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!startTime || !endTime) {
      setErrorMsg('Please specify both Start Time and End Time.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg('End Time must be after Start Time.');
      return;
    }

    const formattedStart = formatTime12h(startTime);
    const formattedEnd = formatTime12h(endTime);
    const slotStr = `${formattedStart} - ${formattedEnd}`;

    if (availableSlots.includes(slotStr)) {
      setErrorMsg('This consultation slot is already added.');
      return;
    }

    setAvailableSlots(prev => [...prev, slotStr]);
    setStartTime('');
    setEndTime('');
  };

  const handleRemoveSlot = (slot) => {
    setErrorMsg('');
    setSuccessMsg('');
    setAvailableSlots(prev => prev.filter(s => s !== slot));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        availableDays,
        availableSlots
      };

      const res = await authService.updateDoctorProfile(payload);
      if (res.success && res.data) {
        setSuccessMsg('Availability settings saved successfully!');
        
        // Update context & local storage
        setUser(res.data);
        localStorage.setItem('bad_user', JSON.stringify(res.data));
      } else {
        setErrorMsg(res.message || 'Failed to save availability settings.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error occurred while updating availability.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-sm text-slate-700">
      
      {/* Subheader */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Availability Settings</h1>
        <p className="text-xs text-slate-400 font-medium">Configure days and hourly slots when patients can book appointments with you.</p>
      </div>

      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Notifications */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-150 text-emerald-850 p-3.5 rounded-xl font-bold text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Available Days */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" /> Available Days of Week
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {daysOfWeek.map((day) => {
                const isChecked = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors text-center
                      ${isChecked 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Available Slots */}
          <div className="space-y-4">
            <span className="block text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" /> Consultation Time Slots
            </span>

            {/* Add slot inputs (clock time selectors) */}
            <div className="flex items-end gap-3 max-w-lg text-xs bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
              <div className="flex-grow">
                <ClockPicker
                  label="Start Time"
                  value={startTime}
                  onChange={setStartTime}
                />
              </div>

              <div className="flex-grow">
                <ClockPicker
                  label="End Time"
                  value={endTime}
                  onChange={setEndTime}
                />
              </div>

              <button
                type="button"
                onClick={handleAddSlot}
                className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 shrink-0 flex items-center justify-center gap-1 font-bold text-xs transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Slot
              </button>
            </div>

            {/* Slots list */}
            {availableSlots.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2">
                No slots configured yet. Please write a time range above.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {availableSlots.map((slot) => (
                  <div 
                    key={slot} 
                    className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded-md hover:bg-slate-200"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="px-8 font-bold"
              loading={isSubmitting}
            >
              Save Schedule Settings
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default DoctorAvailability;
