import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import { 
  Bell, 
  CheckCheck, 
  Calendar, 
  FileText, 
  MessageSquare
} from 'lucide-react';

/**
 * Notifications manager page.
 * Displays list logs, toggles unread statuses, and offers bulk actions.
 */
const PatientNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmittingMarkAll, setIsSubmittingMarkAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await authService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      } else {
        setError(res.message || 'Failed to retrieve notifications list.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notif) => {
    if (notif.isRead) return;
    try {
      const res = await authService.markNotificationRead(notif._id);
      if (res.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    setIsSubmittingMarkAll(true);
    try {
      const res = await authService.markAllNotificationsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      alert(err.message || 'Failed to update notifications read statuses.');
    } finally {
      setIsSubmittingMarkAll(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'report':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500 mt-3">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600 animate-swing" /> Notifications
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Review status updates regarding your consultation requests, reports upload records, and messages.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleMarkAllRead}
            loading={isSubmittingMarkAll}
            className="flex items-center gap-1.5 font-bold border-slate-200"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" /> Mark all as read
          </Button>
        )}
      </div>

      {/* Main List */}
      {error ? (
        <div className="text-center py-12 text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-xl p-4">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 text-slate-500 text-sm">
          You have no notification alerts.
        </div>
      ) : (
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div 
              key={notif._id}
              onClick={() => handleMarkAsRead(notif)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer
                ${notif.isRead ? 'hover:bg-slate-50/30' : 'bg-blue-50/20 hover:bg-blue-50/30'}`}
            >
              {/* Type Icon */}
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>

              {/* Message Details */}
              <div className="flex-grow space-y-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h4 className={`text-sm leading-tight truncate ${notif.isRead ? 'font-bold text-slate-700' : 'font-extrabold text-slate-900'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0 pt-0.5">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${notif.isRead ? 'text-slate-500 font-medium' : 'text-slate-700 font-semibold'}`}>
                  {notif.message}
                </p>
              </div>

              {/* Unread dot indicator */}
              {!notif.isRead && (
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 mt-1.5 shadow-sm shadow-blue-500/30 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientNotifications;
