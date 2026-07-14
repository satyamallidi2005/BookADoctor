import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { 
  Lock, 
  Moon, 
  LogOut, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Patient settings page.
 * Manages password changes, session logout, and future configuration toggles.
 */
const PatientSettings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Dark mode mockup state
  const [darkMode, setDarkMode] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg('All password fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await authService.updateProfile({ password });
      if (res.success) {
        setSuccessMsg('Your password has been changed successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while changing password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Account Settings</h1>
        <p className="text-xs text-slate-400 font-medium">Manage preferences, security credentials, and sessions.</p>
      </div>

      <div className="space-y-6 text-sm text-slate-700">
        
        {/* Security / Password Change */}
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Lock className="w-5 h-5 text-blue-600" /> Security Credentials
          </h3>

          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl font-bold text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <Input
              label="New Password *"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password *"
              type="password"
              placeholder="Retype password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="px-6 font-bold"
              loading={isSubmitting}
            >
              Update Password
            </Button>
          </form>
        </div>

        {/* Preferences / Dark Mode */}
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-500 shrink-0">
              <Moon className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <span className="block font-bold text-slate-800">Interface Preference</span>
              <span className="block text-[11px] text-slate-400">Dark Mode customization theme layout (coming soon).</span>
            </div>
          </div>
          
          <button
            onClick={() => {
              setDarkMode(!darkMode);
              alert('Dark Mode feature is placeholder and will be enabled in a future release!');
            }}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none border
              ${darkMode ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-200'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs
              ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Session Logout */}
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="block font-bold text-slate-850">Close Account Session</span>
            <span className="block text-xs text-slate-400">Securely sign out of your healthcare dashboard session on this browser.</span>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-100 font-bold px-4"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PatientSettings;
