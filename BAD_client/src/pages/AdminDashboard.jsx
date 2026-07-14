import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageContainer from '../components/common/PageContainer';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  UserCog, 
  Calendar, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  ShieldAlert
} from 'lucide-react';

/**
 * Sidebar Navigation Link Component
 */
const SidebarLink = ({ to, icon: Icon, children, end = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200
         ${isActive 
           ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
           : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
         }`
      }
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{children}</span>
    </NavLink>
  );
};

/**
 * Admin Layout featuring sidebar navigation and nested content routing.
 */
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-extrabold text-slate-800 tracking-tight">Admin Console</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          <SidebarLink to="/admin" icon={LayoutDashboard} end>
            Dashboard
          </SidebarLink>

          <div className="pt-2 pb-1 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Doctors
          </div>
          
          <SidebarLink to="/admin/add-doctor" icon={UserPlus}>
            Add Doctor
          </SidebarLink>

          <SidebarLink to="/admin/doctors" icon={Users}>
            All Doctors
          </SidebarLink>

          <div className="pt-2 pb-1 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Management
          </div>

          <SidebarLink to="/admin/patients" icon={UserCog}>
            Patients
          </SidebarLink>

          <SidebarLink to="/admin/appointments" icon={Calendar}>
            Appointments
          </SidebarLink>

          <SidebarLink to="/admin/settings" icon={SettingsIcon}>
            Settings
          </SidebarLink>
        </nav>

        {/* Footer info & logout */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <div className="px-2">
            <p className="text-xs font-bold text-slate-700 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-slate-150 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">Control Center</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
              Role: {user?.role}
            </span>
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 xl:p-10 overflow-auto">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
