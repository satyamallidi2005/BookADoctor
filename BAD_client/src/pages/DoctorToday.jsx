import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { 
  User, 
  Clock, 
  Calendar, 
  Activity, 
  FileText, 
  Plus, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

/**
 * Today's schedule consultations tracker.
 * Hosts consultation completion builder forms.
 */
const DoctorToday = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Complete consultation modal states
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  
  // Dynamic medicines builder states
  const [medicines, setMedicines] = useState([]);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medDuration, setMedDuration] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true);
      const res = await authService.getDoctorAppointments();
      if (res.success && res.data) {
        const todayStr = new Date().toDateString();
        // Filter only accepted appointments scheduled for today
        const todayApps = res.data.filter(app => 
          app.status === 'accepted' && 
          new Date(app.appointmentDate).toDateString() === todayStr
        );
        setAppointments(todayApps);
      } else {
        setError(res.message || 'Failed to retrieve today schedule.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConsultation = (app) => {
    setActiveConsultation(app);
    setDiagnosis('');
    setDoctorNotes('');
    setFollowUpDate('');
    setMedicines([]);
    setMedName('');
    setMedDosage('');
    setMedFrequency('');
    setMedDuration('');
    setFormError('');
    setSuccessMsg('');
  };

  const handleAddMedicine = () => {
    if (!medName || !medDosage || !medFrequency || !medDuration) {
      setFormError('All medicine fields (name, dosage, frequency, duration) must be filled.');
      return;
    }

    const newItem = {
      name: medName,
      dosage: medDosage,
      frequency: medFrequency,
      duration: medDuration
    };

    setMedicines(prev => [...prev, newItem]);
    
    // Clear medicine inputs
    setMedName('');
    setMedDosage('');
    setMedFrequency('');
    setMedDuration('');
    setFormError('');
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
      setFormError('Diagnosis description is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        diagnosis,
        medicines,
        notes: doctorNotes,
        followUpDate: followUpDate || null,
        fileUrl: '' // prescription PDF url would go here, optional
      };

      const res = await authService.completeAppointment(activeConsultation._id, payload);
      if (res.success) {
        setSuccessMsg('Consultation completed and prescription logged successfully.');
        setTimeout(() => {
          setActiveConsultation(null);
          fetchTodaySchedule();
        }, 1500);
      } else {
        setFormError(res.message || 'Failed to submit consultation report.');
      }
    } catch (err) {
      setFormError(err.message || 'Error occurred while saving records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading today's schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm text-slate-700 animate-fadeIn">
      {/* Subheader */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Today's Appointments</h1>
        <p className="text-xs text-slate-400 font-medium">Review and consult patient visits scheduled for today.</p>
      </div>

      {error ? (
        <div className="text-center py-12 text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-xl p-4 max-w-md mx-auto text-sm">
          {error}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 text-slate-500 text-sm">
          No appointments scheduled for today.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {appointments.map((app) => {
            const pat = app.patientId || {};
            const patName = pat.name || 'Patient';
            return (
              <div key={app._id} className="bg-white border border-slate-150 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
                <div className="space-y-4">
                  {/* Patient Row */}
                  <div className="flex items-center justify-between gap-4">
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
                        <span className="text-[10px] text-slate-450 pt-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-450" /> {app.appointmentTime}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {app.status}
                    </span>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Consultation reasons */}
                  <div className="text-xs space-y-1 bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Purpose of Visit</span>
                    <p className="text-slate-650 font-semibold">"{app.reason}"</p>
                    {app.symptoms && (
                      <p className="text-slate-500 text-[11px] pt-1.5 leading-normal">
                        Symptoms: <span className="italic text-slate-650">"{app.symptoms}"</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Consultation Trigger */}
                <div className="pt-4 border-t border-slate-100 mt-4 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                    onClick={() => handleOpenConsultation(app)}
                  >
                    <Activity className="w-4 h-4 animate-pulse" /> Complete Consultation
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Consultation Modal overlay */}
      {activeConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full overflow-hidden text-sm text-slate-700 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-800">Complete Consultation</h3>
                <p className="text-[10px] text-slate-400 pt-0.5">Patient: {activeConsultation.patientId?.name}</p>
              </div>
              <button onClick={() => setActiveConsultation(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleCompleteSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
              
              {/* Alert Feedback */}
              {successMsg && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-150 text-emerald-850 p-3.5 rounded-xl font-bold text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {formError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Diagnosis input */}
              <Input
                label="Diagnosis Details *"
                placeholder="e.g. Acute Bacterial Pharyngitis, Viral Infection"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />

              {/* Medicines Builder section */}
              <div className="space-y-3.5 border border-slate-150 p-4 rounded-2xl">
                <span className="block text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <FileText className="w-4 h-4 text-blue-600" /> Prescribe Medicines
                </span>

                {/* Grid input for single medicine */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Med Name</label>
                    <input
                      type="text"
                      placeholder="Amoxicillin"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Dosage</label>
                    <input
                      type="text"
                      placeholder="500mg"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Frequency</label>
                    <input
                      type="text"
                      placeholder="Three times daily"
                      value={medFrequency}
                      onChange={(e) => setMedFrequency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-1 flex gap-2">
                    <div className="flex-grow space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Duration</label>
                      <input
                        type="text"
                        placeholder="7 days"
                        value={medDuration}
                        onChange={(e) => setMedDuration(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="p-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-lg h-9 shrink-0 flex items-center justify-center self-end"
                      title="Add medicine to prescription list"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Medicines List Table */}
                {medicines.length > 0 && (
                  <div className="overflow-x-auto pt-2 border-t border-slate-100">
                    <table className="min-w-full divide-y divide-slate-100 text-xs text-slate-650">
                      <thead>
                        <tr>
                          <th className="py-2 text-left font-bold text-slate-400 uppercase">Medicine</th>
                          <th className="py-2 text-left font-bold text-slate-400 uppercase">Dosage</th>
                          <th className="py-2 text-left font-bold text-slate-400 uppercase">Frequency</th>
                          <th className="py-2 text-left font-bold text-slate-400 uppercase">Duration</th>
                          <th className="py-2 text-right font-bold text-slate-400 uppercase">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {medicines.map((med, index) => (
                          <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2 font-bold text-slate-800">{med.name}</td>
                            <td className="py-2 text-slate-600">{med.dosage}</td>
                            <td className="py-2 text-slate-600">{med.frequency}</td>
                            <td className="py-2 text-slate-600">{med.duration}</td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveMedicine(index)}
                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
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

              {/* Notes input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Consultation Notes (Prescription Notes)</label>
                <textarea
                  placeholder="Additional patient care advice, dietary recommendations, or follow-up details..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500 min-h-[80px]"
                />
              </div>

              {/* Follow-up Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Follow-up Date (Optional)
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <Button variant="secondary" size="md" type="button" onClick={() => setActiveConsultation(null)}>
                  Close
                </Button>
                <Button variant="primary" size="md" type="submit" loading={isSubmitting} className="px-6 font-bold">
                  Save & Complete Consultation
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorToday;
