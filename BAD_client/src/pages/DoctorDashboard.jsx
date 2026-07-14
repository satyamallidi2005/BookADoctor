import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { 
  Calendar, 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  User, 
  FileText, 
  Activity 
} from 'lucide-react';

/**
 * Doctor Dashboard overview page.
 * Displays schedule statistics, pending request summaries, daily revenue metrics, and quick schedule lists.
 */
const DoctorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySchedule: 0,
    pendingRequests: 0,
    completedToday: 0,
    cancelledToday: 0,
    revenueToday: 0
  });
  const [todayList, setTodayList] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await authService.getDoctorAppointments();
      if (res.success && res.data) {
        const list = res.data;

        const todayStr = new Date().toDateString();

        // 1. Calculate Stats
        const todayAccepted = list.filter(a => a.status === 'accepted' && new Date(a.appointmentDate).toDateString() === todayStr);
        const pending = list.filter(a => a.status === 'pending');
        const completedToday = list.filter(a => a.status === 'completed' && new Date(a.appointmentDate).toDateString() === todayStr);
        const cancelledToday = list.filter(a => a.status === 'cancelled' && new Date(a.appointmentDate).toDateString() === todayStr);
        const revenue = completedToday.reduce((acc, curr) => acc + (curr.consultationFee || 0), 0);

        setStats({
          todaySchedule: todayAccepted.length,
          pendingRequests: pending.length,
          completedToday: completedToday.length,
          cancelledToday: cancelledToday.length,
          revenueToday: revenue
        });

        // 2. Set Today's Schedule List
        setTodayList(todayAccepted);
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const docName = user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name}`;

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading your dashboard statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-sm text-slate-700">
      
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-650 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/25 rounded-full filter blur-xl" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-550/50 text-blue-100 text-xs font-semibold uppercase tracking-wider">
            Clinical Console
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">Welcome back, {docName}!</h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-lg">
            Manage today's consultation sessions, review incoming requests, and archive patient treatment history.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        
        {/* Today's Schedule */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Today's Visits</span>
            <span className="block text-2xl font-black text-slate-800 pt-1.5 leading-none">{stats.todaySchedule}</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shrink-0">
            <UserCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Requests</span>
            <span className="block text-2xl font-black text-slate-800 pt-1.5 leading-none">{stats.pendingRequests}</span>
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Completed</span>
            <span className="block text-2xl font-black text-slate-800 pt-1.5 leading-none">{stats.completedToday}</span>
          </div>
        </div>

        {/* Cancelled Today */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 shrink-0">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Cancelled</span>
            <span className="block text-2xl font-black text-slate-800 pt-1.5 leading-none">{stats.cancelledToday}</span>
          </div>
        </div>

        {/* Revenue Today */}
        <div className="bg-white border border-slate-150 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0">
            <DollarSign className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Revenue Today</span>
            <span className="block text-2xl font-black text-slate-800 pt-1.5 leading-none">${stats.revenueToday}</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Today's Appointments & Quick Shortcuts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Today's Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-850 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 animate-pulse" /> Today's Active Schedule
            </h3>

            {todayList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No consultations confirmed for today.
              </div>
            ) : (
              <div className="space-y-4">
                {todayList.map((app) => (
                  <div key={app._id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100 shrink-0 overflow-hidden">
                        {app.patientId?.profileImage ? (
                          <img src={app.patientId.profileImage} alt={app.patientId.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 leading-none">{app.patientId?.name || 'Patient'}</h4>
                        <span className="block text-[10px] text-slate-450 pt-1">Time Slot: <strong className="text-slate-700">{app.appointmentTime}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {app.status}
                      </span>
                      <Link to="/doctor/today" className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-0.5">
                        Consult <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-150 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to="/doctor/requests" 
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:border-blue-200 hover:bg-slate-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-amber-500 group-hover:scale-105 transition-transform" />
                  <div className="text-left">
                    <span className="block font-bold text-slate-800 text-xs leading-none">Review Requests</span>
                    <span className="block text-[10px] text-slate-400 pt-1 leading-none">Respond to pending slots</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link 
                to="/doctor/today" 
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:border-blue-200 hover:bg-slate-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-500 group-hover:scale-105 transition-transform" />
                  <div className="text-left">
                    <span className="block font-bold text-slate-800 text-xs leading-none">Today's Visits</span>
                    <span className="block text-[10px] text-slate-400 pt-1 leading-none">Complete consult sessions</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link 
                to="/doctor/patients" 
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-150 hover:border-blue-200 hover:bg-slate-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-500 group-hover:scale-105 transition-transform" />
                  <div className="text-left">
                    <span className="block font-bold text-slate-800 text-xs leading-none">Patient Logs</span>
                    <span className="block text-[10px] text-slate-400 pt-1 leading-none">Check medical treatment history</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DoctorDashboard;
