import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import { 
  Search, 
  Filter, 
  User, 
  ChevronRight, 
  X,
  Lock,
  Stethoscope
} from 'lucide-react';

/**
 * Admin appointments management list.
 * Displays overall appointments table with filters, search, and details modal.
 */
const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Queries
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Details sheet modal
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        status: statusFilter,
        date: dateFilter
      };
      const res = await authService.getAllAppointmentsAdmin(params);
      if (res.success && res.data) {
        setAppointments(res.data);
      } else {
        setError(res.message || 'Failed to retrieve appointments list.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading schedule data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'rejected':
      case 'cancelled':
        return 'bg-slate-100 text-slate-500 border border-slate-200';
      default:
        return 'bg-slate-50 text-slate-500';
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading administrative logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm text-slate-700 animate-fadeIn">
      {/* Subheader */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Appointment Ledger</h1>
        <p className="text-xs text-slate-400 font-medium">Review and audit all consultation bookings registered across the portal.</p>
      </div>

      {/* Query Filters row */}
      <div className="bg-white border border-slate-150 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-sm">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor, patient, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-16 py-2 w-full bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 h-10 transition-colors"
          />
          <button 
            type="submit" 
            className="absolute right-2.5 top-2 bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-[10px] hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-blue-500 outline-none text-xs"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-blue-500 outline-none text-xs h-9"
          />

          {/* Reset Filters */}
          {(statusFilter || dateFilter || search) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setDateFilter('');
                setSearch('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <div className="text-center py-12 text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-xl p-4 max-w-md mx-auto text-sm">
          {error}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 text-slate-500 text-sm">
          No appointments found.
        </div>
      ) : (
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-slate-650">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Time Slot</th>
                  <th className="px-5 py-3 text-left font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right font-bold text-slate-400 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((app) => {
                  const patName = app.patientId?.name || 'Patient';
                  const docName = app.doctorId?.name ? `Dr. ${app.doctorId.name}` : 'Doctor';
                  return (
                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{patName}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-700">
                        {docName}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                        {new Date(app.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                        {app.appointmentTime}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold"
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
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden text-sm text-slate-700">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-slate-800">Booking Audit Sheet</h3>
              <button onClick={() => setSelectedApp(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Patient & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><User className="w-3.5 h-3.5" /> Patient Details</span>
                  <h4 className="font-bold text-slate-800 leading-tight">{selectedApp.patientId?.name}</h4>
                  <p className="text-[10px] text-slate-450 pt-0.5">{selectedApp.patientId?.email}</p>
                  <p className="text-[10px] text-slate-450">{selectedApp.patientId?.phone}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" /> Doctor Details</span>
                  <h4 className="font-bold text-slate-800 leading-tight">Dr. {selectedApp.doctorId?.name}</h4>
                  <p className="text-[10px] text-slate-450 pt-0.5">{selectedApp.doctorId?.email}</p>
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consult Date</span>
                  <p className="font-bold text-slate-700">{new Date(selectedApp.appointmentDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</span>
                  <p className="font-bold text-slate-700">{selectedApp.appointmentTime}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(selectedApp.status)}`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consultation Fee</span>
                  <p className="font-bold text-slate-750">${selectedApp.consultationFee}</p>
                </div>
              </div>

              {/* Consultation description */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Purpose of Visit</span>
                <p className="italic text-slate-650 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  "{selectedApp.reason}"
                </p>
              </div>

              {/* Symptoms */}
              {selectedApp.symptoms && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Symptoms Reported</span>
                  <p className="italic text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{selectedApp.symptoms}"
                  </p>
                </div>
              )}

              {/* Clinical notes lock check */}
              {selectedApp.status === 'completed' && (
                <div className="bg-blue-50 border border-blue-150 p-4 rounded-xl flex items-center justify-between text-xs text-blue-800">
                  <div className="flex items-center gap-2 font-semibold">
                    <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Clinical Notes & Prescription are locked.</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Privacy Guard
                  </span>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setSelectedApp(null)} className="px-5 font-bold">
                Close Audit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
