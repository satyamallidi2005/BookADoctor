import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, Users, Calendar, ShieldCheck } from 'lucide-react';

/**
 * Default index page for the Admin Dashboard panel.
 */
const AdminHome = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Registered Doctors', value: 'Placeholder', icon: Stethoscope, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Patients', value: 'Placeholder', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Appointments', value: 'Coming Soon', icon: Calendar, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Welcome, {user?.name}!</h1>
          <p className="text-sm text-slate-500">You are logged in as the system administrator. Use the navigation sidebar to configure system properties.</p>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <p className="text-xl font-extrabold text-slate-850">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHome;
