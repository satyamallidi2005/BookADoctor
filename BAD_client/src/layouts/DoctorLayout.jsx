import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import PageContainer from '../components/common/PageContainer';
import { 
  LayoutDashboard, 
  CalendarRange, 
  UserCheck, 
  History, 
  Clock, 
  Users, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  HeartPulse
} from 'lucide-react';

/**
 * Sidebar Navigation Layout wrapper for Doctor Dashboard Portal.
 * Features collapsible sidebar, responsive header, and unread notification badge calculations.
 */
const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadNotificationsCount();
    const interval = setInterval(fetchUnreadNotificationsCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadNotificationsCount = async () => {
    try {
      const res = await authService.getNotifications();
      if (res.success && res.data) {
        const count = res.data.filter(n => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Failed to update doctor notifications badge:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { label: "Today's Schedule", path: '/doctor/today', icon: CalendarRange },
    { label: 'Requests', path: '/doctor/requests', icon: UserCheck },
    { label: 'History', path: '/doctor/history', icon: History },
    { label: 'Availability', path: '/doctor/availability', icon: Clock },
    { label: 'My Patients', path: '/doctor/patients', icon: Users },
    { label: 'Profile', path: '/doctor/profile', icon: User },
    { 
      label: 'Notifications', 
      path: '/doctor/notifications', 
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null 
    },
    { label: 'Settings', path: '/doctor/settings', icon: Settings },
  ];

  const getPageTitle = (pathname) => {
    if (pathname.includes('/doctor/dashboard')) return 'Doctor Dashboard';
    if (pathname.includes('/doctor/today')) return "Today's Appointments";
    if (pathname.includes('/doctor/requests')) return 'Appointment Requests';
    if (pathname.includes('/doctor/history')) return 'Appointment History';
    if (pathname.includes('/doctor/availability')) return 'Availability Settings';
    if (pathname.includes('/doctor/patients')) return 'My Patients';
    if (pathname.includes('/doctor/profile')) return 'Doctor Profile';
    if (pathname.includes('/doctor/notifications')) return 'Notifications Hub';
    if (pathname.includes('/doctor/settings')) return 'Settings';
    return 'Doctor Console';
  };

  const activeLinkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
        : 'text-gray-650 hover:bg-slate-50 hover:text-blue-600'
    }`;

  const docName = user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name}`;

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-150 shrink-0 sticky top-0 h-screen p-5 justify-between">
        <div className="space-y-6">
          <div className="px-2 pt-2 shrink-0 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-blue-600 shrink-0" />
            <span className="text-lg font-black text-slate-800 leading-none">Doctor Portal</span>
          </div>
          
          <nav className="space-y-1 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={activeLinkClass}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-grow">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full leading-none animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer profile & logout */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100 shrink-0 overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-800 truncate leading-none">{docName}</span>
              <span className="block text-[10px] text-slate-400 truncate pt-1">{user?.email}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-150 flex items-center justify-between px-6 lg:px-10 shrink-0 z-40 sticky top-0">
          {/* Mobile Left logo placeholder */}
          <div className="lg:hidden flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-blue-600" />
            <span className="text-base font-black text-slate-850">Doctor Portal</span>
          </div>

          {/* Desktop Left Page Title */}
          <div className="hidden lg:block">
            <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">{getPageTitle(location.pathname)}</span>
          </div>

          {/* Mobile Right Menu Button */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg text-slate-650 hover:bg-slate-50 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Right Info */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-500">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-slate-700">Practitioner Console: <strong className="text-blue-600 font-extrabold">{docName}</strong></span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden animate-fadeIn">
            <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" />
            
            <div className="relative flex flex-col w-64 max-w-xs bg-white h-full p-5 justify-between animate-slideRight">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2 pt-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-black text-slate-800">Doctor Portal</span>
                  </div>
                  <button onClick={() => setIsMobileOpen(false)} className="p-1 rounded-md text-slate-400 hover:bg-slate-50">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink 
                        key={item.path} 
                        to={item.path} 
                        className={activeLinkClass}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-grow">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full leading-none">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 overflow-hidden">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-800 truncate leading-none">{docName}</span>
                    <span className="block text-[10px] text-slate-400 truncate pt-1">{user?.email}</span>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Wrapper */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 xl:p-10 overflow-auto w-full">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>

      </div>
    </div>
  );
};

export default DoctorLayout;
