import React, { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { 
  Search, 
  Edit2, 
  Power, 
  Key, 
  X, 
  AlertTriangle, 
  CheckCircle,
  UserCheck,
  UserX
} from 'lucide-react';

/**
 * Admin Panel Doctor Management dashboard.
 */
const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Toast / Alerts states
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'edit' | 'password' | 'status' | null
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Form states for modals
  const [editForm, setEditForm] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authService.getDoctors(search);
      if (res.success && res.data) {
        setDoctors(res.data);
      } else {
        setError(res.message || 'Failed to retrieve doctors.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading doctor registries.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const showSuccess = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const showError = (msg) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(''), 4000);
  };

  // Open Edit Modal
  const handleEditClick = (doc) => {
    setSelectedDoctor(doc);
    const profile = doc.doctorProfile || {};
    setEditForm({
      name: doc.name || '',
      email: doc.email || '',
      phone: doc.phone || '',
      gender: doc.gender || 'male',
      qualification: profile.qualification || '',
      specialization: profile.specialization || '',
      experience: profile.experience || '',
      hospital: profile.hospital || '',
      consultationFee: profile.consultationFee || '',
      availableDaysStr: profile.availableDays ? profile.availableDays.join(', ') : '',
      availableSlotsStr: profile.availableSlots ? profile.availableSlots.join(', ') : '',
      about: profile.about || '',
      profileImage: doc.profileImage || '',
    });
    setActiveModal('edit');
  };

  // Open Password Modal
  const handlePasswordClick = (doc) => {
    setSelectedDoctor(doc);
    setNewPassword('');
    setActiveModal('password');
  };

  // Open Status Confirmation Modal
  const handleStatusClick = (doc) => {
    setSelectedDoctor(doc);
    setActiveModal('status');
  };

  // Submit Doctor Edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Parse days and slots from comma separated string
      const days = editForm.availableDaysStr.split(',').map(d => d.trim()).filter(Boolean);
      const slots = editForm.availableSlotsStr.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        gender: editForm.gender,
        qualification: editForm.qualification,
        specialization: editForm.specialization,
        experience: Number(editForm.experience),
        hospital: editForm.hospital,
        consultationFee: Number(editForm.consultationFee),
        availableDays: days,
        availableSlots: slots,
        about: editForm.about,
        profileImage: editForm.profileImage,
      };

      const res = await authService.updateDoctor(selectedDoctor._id, payload);
      if (res.success) {
        showSuccess(`Doctor ${editForm.name} updated successfully!`);
        fetchDoctors();
        setActiveModal(null);
      } else {
        showError(res.message || 'Failed to update doctor.');
      }
    } catch (err) {
      showError(err.message || 'An error occurred during update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Password Reset
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authService.resetDoctorPassword(selectedDoctor._id, newPassword);
      if (res.success) {
        showSuccess(`Password for Dr. ${selectedDoctor.name} reset successfully!`);
        setActiveModal(null);
      } else {
        showError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      showError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Status Toggle (Soft Delete)
  const handleStatusToggle = async () => {
    setIsSubmitting(true);
    try {
      const res = await authService.toggleDoctorStatus(selectedDoctor._id);
      if (res.success) {
        const action = res.data.isActive ? 'reactivated' : 'deactivated';
        showSuccess(`Doctor account successfully ${action}!`);
        fetchDoctors();
        setActiveModal(null);
      } else {
        showError(res.message || 'Failed to toggle status.');
      }
    } catch (err) {
      showError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      {/* Toast Alert popups */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-md text-sm font-semibold animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl shadow-md text-sm font-semibold animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Subheader Search actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Found {doctors.length} doctors
        </div>
      </div>

      {/* Main Table view */}
      {loading && doctors.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 mt-2 font-medium">Fetching doctors list...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-xl p-4 max-w-md mx-auto">
          {error}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 text-slate-500 text-sm">
          No doctor accounts found matching the search criteria.
        </div>
      ) : (
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {doctors.map((doc) => {
                  const prof = doc.doctorProfile || {};
                  const isAct = doc.isActive;
                  const docName = doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`;
                  return (
                    <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 uppercase border border-blue-100">
                            {doc.profileImage ? (
                              <img src={doc.profileImage} alt={docName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              doc.name.charAt(0)
                            )}
                          </div>
                          <div className="font-bold text-slate-800 leading-tight">
                            {docName}
                            <span className="block text-[10px] text-slate-400 font-semibold">{prof.qualification || 'MBBS'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        <span className="block text-xs leading-none">{doc.email}</span>
                        <span className="block text-[10px] pt-1">{doc.phone}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-semibold text-xs uppercase tracking-wide">
                        {prof.specialization || 'Specialist'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                        {prof.hospital || 'General Hospital'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${isAct ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                          {isAct ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {isAct ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-1">
                        <Button variant="secondary" size="sm" onClick={() => handleEditClick(doc)} title="Edit profile" className="px-2 py-1.5 border-slate-200">
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handlePasswordClick(doc)} title="Reset Password" className="px-2 py-1.5 border-slate-200">
                          <Key className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleStatusClick(doc)} 
                          title={isAct ? 'Deactivate doctor' : 'Reactivate doctor'}
                          className={`px-2 py-1.5 border-slate-200 ${isAct ? 'hover:bg-rose-50' : 'hover:bg-emerald-50'}`}
                        >
                          <Power className={`w-3.5 h-3.5 ${isAct ? 'text-rose-500' : 'text-emerald-500'}`} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Doctor Overlay Modal */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-slate-800">Edit Profile for {selectedDoctor?.name}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 flex-grow overflow-y-auto text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Doctor Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
                
                {/* Gender select */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-bold text-slate-500 uppercase">Gender *</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Input
                  label="Qualification"
                  value={editForm.qualification}
                  onChange={(e) => setEditForm(prev => ({ ...prev, qualification: e.target.value }))}
                  required
                />
                <Input
                  label="Specialization"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm(prev => ({ ...prev, specialization: e.target.value }))}
                  required
                />
                <Input
                  label="Experience (Years)"
                  type="number"
                  value={editForm.experience}
                  onChange={(e) => setEditForm(prev => ({ ...prev, experience: e.target.value }))}
                  required
                />
                <Input
                  label="Hospital Location"
                  value={editForm.hospital}
                  onChange={(e) => setEditForm(prev => ({ ...prev, hospital: e.target.value }))}
                  required
                />
                <Input
                  label="Consultation Fee ($)"
                  type="number"
                  value={editForm.consultationFee}
                  onChange={(e) => setEditForm(prev => ({ ...prev, consultationFee: e.target.value }))}
                  required
                />
                <Input
                  label="Profile Image Link (Optional)"
                  value={editForm.profileImage}
                  onChange={(e) => setEditForm(prev => ({ ...prev, profileImage: e.target.value }))}
                />

                <Input
                  label="Available Days (Comma separated)"
                  placeholder="e.g. Mon, Wed, Fri"
                  value={editForm.availableDaysStr}
                  onChange={(e) => setEditForm(prev => ({ ...prev, availableDaysStr: e.target.value }))}
                  className="sm:col-span-2"
                  required
                />

                <Input
                  label="Available Slots (Comma separated)"
                  placeholder="e.g. 09:00 AM - 12:00 PM, 02:00 PM - 05:00 PM"
                  value={editForm.availableSlotsStr}
                  onChange={(e) => setEditForm(prev => ({ ...prev, availableSlotsStr: e.target.value }))}
                  className="sm:col-span-2"
                  required
                />

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Biography (About)</label>
                  <textarea
                    value={editForm.about}
                    onChange={(e) => setEditForm(prev => ({ ...prev, about: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500 min-h-[80px]"
                    placeholder="Short doctor introduction..."
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)} className="px-4">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={isSubmitting} className="px-6 font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Reset Password</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Assign a new temporary password for Dr. <strong className="text-slate-800">{selectedDoctor?.name}</strong>. The practitioner will use this to sign in.
              </p>
              
              <Input
                label="New Temporary Password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)} className="px-4">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={isSubmitting} className="px-6 font-bold">
                  Save Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {activeModal === 'status' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-855">Confirm Status Change</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <span className="text-xs font-semibold">
                  {selectedDoctor?.isActive 
                    ? 'Deactivating this doctor will hide them from the public booking directory.'
                    : 'Reactivating this doctor will list them back on the patient directory.'}
                </span>
              </div>
              
              <p>
                Are you sure you want to {selectedDoctor?.isActive ? 'deactivate' : 'reactivate'}{' '}
                <strong>Dr. {selectedDoctor?.name}</strong>?
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)} className="px-4">
                  Cancel
                </Button>
                <Button 
                  onClick={handleStatusToggle} 
                  variant={selectedDoctor?.isActive ? 'danger' : 'primary'} 
                  size="sm" 
                  loading={isSubmitting} 
                  className="px-6 font-bold"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
