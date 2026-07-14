import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import Logo from '../components/common/Logo';
import PageContainer from '../components/common/PageContainer';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  Calendar, 
  FileText, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

/**
 * Sidebar Navigation Layout for Patient Dashboard Portal.
 * Features collapsible sidebar, responsive layout, dynamic notifications badges.
 */
const PatientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const getPageTitle = (pathname) => {
    if (pathname.includes('/patient/dashboard')) return 'Dashboard';
    if (pathname.includes('/patient/book')) return 'Book Appointment';
    if (pathname.includes('/patient/appointments')) return 'My Appointments';
    if (pathname.includes('/patient/reports')) return 'Medical Reports';
    if (pathname.includes('/patient/notifications')) return 'Notifications';
    if (pathname.includes('/patient/profile')) return 'My Profile';
    if (pathname.includes('/patient/settings')) return 'Account Settings';
    return 'Patient Portal';
  };

  useEffect(() => {
    fetchUnreadNotificationsCount();
    // Poll notifications count every 30 seconds for a premium reactive experience
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
      console.error('Failed to update navbar notifications count:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Book Appointment', path: '/patient/book', icon: CalendarPlus },
    { label: 'My Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'Medical Reports', path: '/patient/reports', icon: FileText },
    { 
      label: 'Notifications', 
      path: '/patient/notifications', 
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null 
    },
    { label: 'Profile', path: '/patient/profile', icon: User },
    { label: 'Settings', path: '/patient/settings', icon: Settings },
  ];

  const activeLinkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
        : 'text-gray-600 hover:bg-slate-50 hover:text-blue-600'
    }`;

  const docName = user?.name?.startsWith('Dr.') ? user.name : user?.name;

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-150 shrink-0 sticky top-0 h-screen p-5 justify-between">
        <div className="space-y-6">
          <div className="px-2 pt-2 shrink-0">
            <Logo />
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

      {/* Header Bar */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-150 flex items-center justify-between px-6 lg:px-10 shrink-0 z-40 sticky top-0">
          {/* Mobile Left */}
          <div className="lg:hidden">
            <Logo />
          </div>

          {/* Desktop Left: Dynamic Page Title */}
          <div className="hidden lg:block">
            <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">{getPageTitle(location.pathname)}</span>
          </div>

          {/* Mobile Right */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Right: Greet patient & display calendar date */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-500">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-slate-700">Health Portal: <strong className="text-blue-600 font-extrabold">{docName}</strong></span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden animate-fadeIn">
            {/* Backdrop */}
            <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" />
            
            {/* Drawer */}
            <div className="relative flex flex-col w-64 max-w-xs bg-white h-full p-5 justify-between animate-slideRight">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2 pt-2 shrink-0">
                  <Logo />
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

export default PatientLayout;
