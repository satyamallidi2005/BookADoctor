import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 
  CalendarPlus, 
  FileText, 
  Stethoscope, 
  Bell 
} from 'lucide-react';

/**
 * Patient Dashboard portal page.
 * Displays patient summary statistics, upcoming appointments, recent notification logs, and quick actions.
 */
const PatientDashboard = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, cancelled: 0 });
  const [nextAppointment, setNextAppointment] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch both appointments and notifications in parallel
      const [appRes, notifRes] = await Promise.all([
        authService.getAppointments(),
        authService.getNotifications()
      ]);

      if (appRes.success && appRes.data) {
        const apps = appRes.data;

        // Calculate statistics
        const upcoming = apps.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
        const completed = apps.filter(a => a.status === 'completed').length;
        const cancelled = apps.filter(a => a.status === 'cancelled').length;
        setStats({ upcoming, completed, cancelled });

        // Find closest upcoming appointment
        const upcomingApps = apps.filter(a => a.status === 'confirmed' || a.status === 'pending');
        const sortedUpcoming = [...upcomingApps].sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        setNextAppointment(sortedUpcoming[0] || null);
      }

      if (notifRes.success && notifRes.data) {
        setNotifications(notifRes.data.slice(0, 3)); // show top 3 recent notifications
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const docName = user?.name?.startsWith('Dr.') ? user.name : user?.name;

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading dashboard details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/25 rounded-full filter blur-xl" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-550/50 text-blue-100 text-xs font-semibold uppercase tracking-wider">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">Welcome, {docName}!</h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-lg">
            Manage your schedule, upload test reports, and keep track of your consultation updates in one single dashboard.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 shrink-0">
        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Visits</span>
            <span className="block text-2xl font-black text-slate-800 pt-0.5">{stats.upcoming}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Visits</span>
            <span className="block text-2xl font-black text-slate-800 pt-0.5">{stats.completed}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 shrink-0">
            <XCircle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Cancelled Visits</span>
            <span className="block text-2xl font-black text-slate-800 pt-0.5">{stats.cancelled}</span>
          </div>
        </div>
      </div>

      {/* Middle Layout panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Next Visit & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Visit display */}
          <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Upcoming Appointment
            </h3>

            {nextAppointment ? (
              <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100 overflow-hidden">
                    {nextAppointment.doctorId?.profileImage ? (
                      <img src={nextAppointment.doctorId.profileImage} alt={nextAppointment.doctorId.name} className="w-full h-full object-cover" />
                    ) : (
                      <Stethoscope className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-tight">
                      Dr. {nextAppointment.doctorId?.name}
                    </h4>
                    <span className="block text-[11px] font-bold text-blue-600 uppercase tracking-wide pt-0.5">
                      {nextAppointment.doctorId?.doctorProfile?.specialization || 'Medical Specialist'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Date & Time</span>
                    <p className="font-bold text-slate-700 pt-0.5">
                      {new Date(nextAppointment.appointmentDate).toLocaleDateString()} at {nextAppointment.appointmentTime}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Consultation Hospital</span>
                    <p className="font-bold text-slate-700 pt-0.5">
                      {nextAppointment.doctorId?.doctorProfile?.hospital || 'General Clinic'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                    ${nextAppointment.status === 'confirmed' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                    {nextAppointment.status}
                  </span>
                  <Link to="/patient/appointments" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
                    Manage Appointment <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No upcoming visits registered. Needs scheduling?
                <Link to="/patient/book" className="block text-blue-600 hover:text-blue-800 font-bold pt-2 hover:underline">
                  Book your first appointment now
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions grid */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-800">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/patient/book" className="bg-white border border-slate-150 p-5 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
                <CalendarPlus className="w-8 h-8 text-blue-600 group-hover:scale-105 transition-transform" />
                <span className="block font-bold text-slate-800 text-sm mt-3">Book Appointment</span>
                <span className="block text-[11px] text-slate-400 pt-1 leading-normal">Schedule visit with medical specialist.</span>
              </Link>

              <Link to="/patient/book" className="bg-white border border-slate-150 p-5 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
                <Stethoscope className="w-8 h-8 text-indigo-600 group-hover:scale-105 transition-transform" />
                <span className="block font-bold text-slate-800 text-sm mt-3">View Doctors</span>
                <span className="block text-[11px] text-slate-400 pt-1 leading-normal">Browse available practitioners list.</span>
              </Link>

              <Link to="/patient/reports" className="bg-white border border-slate-150 p-5 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
                <FileText className="w-8 h-8 text-emerald-600 group-hover:scale-105 transition-transform" />
                <span className="block font-bold text-slate-800 text-sm mt-3">View Reports</span>
                <span className="block text-[11px] text-slate-400 pt-1 leading-normal">Upload and download health documents.</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Notifications Tray */}
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Bell className="w-4 h-4 text-blue-600" /> Recent Updates
          </h3>

          <div className="space-y-3.5">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif._id} className="text-xs space-y-1 relative pl-3.5 border-l-2 border-blue-500">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{notif.title}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-500 leading-normal">{notif.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No notification alerts found.
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <Link to="/patient/notifications" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
