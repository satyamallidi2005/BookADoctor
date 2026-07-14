import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import { 
  User, 
  Calendar, 
  X, 
  Search, 
  Clipboard 
} from 'lucide-react';

/**
 * Doctor unique patients history manager.
 * Displays tables of unique patients and queries previous consultation timelines.
 */
const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Patient timeline slideover states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchUniquePatients();
  }, []);

  const fetchUniquePatients = async () => {
    try {
      setLoading(true);
      const res = await authService.getDoctorAppointments();
      if (res.success && res.data) {
        // Construct unique patients map
        const uniqueMap = {};
        res.data.forEach(app => {
          if (app.patientId) {
            uniqueMap[app.patientId._id] = app.patientId;
          }
        });
        setPatients(Object.values(uniqueMap));
      } else {
        setError(res.message || 'Failed to retrieve patient registry.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading patient records.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTimeline = async (patient) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    try {
      const res = await authService.getPatientHistory(patient._id);
      if (res.success && res.data) {
        setPatientHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to load patient consultation timeline:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && patients.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading patient registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm text-slate-700 animate-fadeIn relative">
      
      {/* Subheader */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">My Patients</h1>
        <p className="text-xs text-slate-400 font-medium">Browse clinical logs and medical timelines of patients you have consulted.</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full bg-white rounded-xl border border-slate-150 p-2 shadow-xs">
        <Search className="absolute left-4 top-4.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-850 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Main Table */}
      {error ? (
        <div className="text-center py-12 text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-xl p-4 max-w-md mx-auto text-sm">
          {error}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 text-slate-500 text-sm">
          No patients found in your clinical registry.
        </div>
      ) : (
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-slate-650">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Patient Name</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Gender</th>
                  <th className="px-5 py-3 text-right font-bold text-slate-400 uppercase tracking-wider">Medical History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100 shrink-0 overflow-hidden">
                          {pat.profileImage ? (
                            <img src={pat.profileImage} alt={pat.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-bold text-slate-800">{pat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                      {pat.email}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-550">
                      {pat.phone}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap capitalize">
                      {pat.gender}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenTimeline(pat)}
                        className="text-[10px] font-bold border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 px-3.5 py-1.5"
                      >
                        Timeline History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient History Sidebar Slide-out Drawer */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
          {/* Backdrop */}
          <div onClick={() => setSelectedPatient(null)} className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" />

          {/* Slider Panel */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-slideRight p-6 border-l border-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100 overflow-hidden">
                  {selectedPatient.profileImage ? (
                    <img src={selectedPatient.profileImage} alt={selectedPatient.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-850 text-sm leading-none">{selectedPatient.name}</h3>
                  <span className="block text-[10px] text-slate-400 pt-1.5 leading-none">Medical Timeline log</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 border border-transparent hover:border-slate-150 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Timeline */}
            <div className="flex-grow overflow-y-auto py-5 space-y-6">
              {loadingHistory ? (
                <div className="text-center py-20 text-xs text-slate-400">
                  <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Loading medical records...
                </div>
              ) : patientHistory.length === 0 ? (
                <div className="text-center py-20 text-xs text-slate-400">
                  No previous consultation records with this patient.
                </div>
              ) : (
                <div className="relative pl-6 border-l border-slate-200 ml-3 space-y-6">
                  {patientHistory.map((app) => (
                    <div key={app._id} className="relative text-xs">
                      {/* Timeline dot */}
                      <div className="absolute -left-[30px] top-1.5 w-4 h-4 bg-white border-2 border-blue-650 rounded-full flex items-center justify-center shadow-xs">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      </div>

                      {/* Card block */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-750 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(app.appointmentDate).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                            ${app.status === 'completed' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                            {app.status}
                          </span>
                        </div>

                        {/* Consultation Reason */}
                        <div className="text-[11px] text-slate-650 leading-relaxed pt-1 border-t border-slate-200/50">
                          <span className="block font-bold text-slate-450 uppercase pb-0.5">Purpose</span>
                          <p className="italic">"{app.reason}"</p>
                        </div>

                        {/* Prescription details */}
                        {app.prescriptionId && (
                          <div className="space-y-1.5 bg-white border border-slate-100 p-3 rounded-lg text-[11px]">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Clipboard className="w-3.5 h-3.5 text-blue-600" /> Diagnosis: <span className="text-slate-600 font-medium">{app.prescriptionId.diagnosis}</span>
                            </span>
                            {app.prescriptionId.medicines?.length > 0 && (
                              <div className="pt-1.5 border-t border-slate-100">
                                <span className="block text-[9px] font-extrabold text-slate-400 uppercase pb-1">Medicines</span>
                                <div className="space-y-1">
                                  {app.prescriptionId.medicines.map((med, idx) => (
                                    <div key={idx} className="flex justify-between font-medium text-slate-600">
                                      <span>💊 {med.name} ({med.dosage})</span>
                                      <span className="text-slate-400">{med.frequency} - {med.duration}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setSelectedPatient(null)} className="px-5 font-bold">
                Close Timeline
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorPatients;
