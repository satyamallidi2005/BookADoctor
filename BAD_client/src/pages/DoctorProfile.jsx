import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import Button from '../components/common/Button';
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Award, 
  MapPin, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

/**
 * Doctor Profile editor screen.
 * Handles core practitioner parameters alongside User base properties.
 */
const DoctorProfile = () => {
  const { user, setUser } = useAuth();
  const prof = user?.doctorProfile || {};

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || 'male',
    profileImage: user?.profileImage || '',
    qualification: prof.qualification || '',
    specialization: prof.specialization || '',
    experience: prof.experience || 0,
    hospital: prof.hospital || '',
    consultationFee: prof.consultationFee || 0,
    about: prof.about || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.qualification || !formData.specialization || !formData.hospital) {
      setErrorMsg('All fields marked with an asterisk (*) are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        profileImage: formData.profileImage,
        qualification: formData.qualification,
        specialization: formData.specialization,
        experience: Number(formData.experience),
        hospital: formData.hospital,
        consultationFee: Number(formData.consultationFee),
        about: formData.about
      };

      const res = await authService.updateDoctorProfile(payload);
      if (res.success && res.data) {
        setSuccessMsg('Your doctor profile has been updated successfully!');
        
        // Update context & local storage
        setUser(res.data);
        localStorage.setItem('bad_user', JSON.stringify(res.data));
      } else {
        setErrorMsg(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during profile update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const docName = user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name}`;

  return (
    <div className="space-y-6 animate-fadeIn text-sm text-slate-700">
      
      {/* Subheader */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Doctor Profile</h1>
        <p className="text-xs text-slate-400 font-medium">Update your credentials, hospital details, and profile description.</p>
      </div>

      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Card Header */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-650 font-black text-lg border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0)
            )}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 leading-tight">
              {docName}
            </h2>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider block mt-1.5 w-max mx-auto sm:mx-0">
              {formData.specialization || 'Medical Specialist'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Notifications */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl font-bold text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Section (Account Fields) */}
          <div className="space-y-4">
            <span className="block text-xs font-bold text-slate-500 uppercase">Account Details</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Email (Disabled) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed outline-none"
                  />
                  <Lock className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Doctor Section (Clinical Fields) */}
          <div className="space-y-4">
            <span className="block text-xs font-bold text-slate-500 uppercase">Clinical Credentials</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Qualification */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-blue-600" /> Qualification *
                </label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g. MBBS, MD Cardiology"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Specialization */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Specialization *</label>
                <input
                  type="text"
                  name="specialization"
                  placeholder="e.g. Cardiologist, Dermatologist"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Experience */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Years of Experience *</label>
                <input
                  type="number"
                  name="experience"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Fee */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Consultation Fee ($) *
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  min="0"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Hospital */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Hospital Clinic *
                </label>
                <input
                  type="text"
                  name="hospital"
                  placeholder="e.g. City General Hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Profile Image url */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Profile Photo Link</label>
                <input
                  type="text"
                  name="profileImage"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.profileImage}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                />
              </div>

              {/* About description */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> About / Bio
                </label>
                <textarea
                  name="about"
                  placeholder="Write a brief introduction about your medical expertise and clinical style..."
                  value={formData.about}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500 min-h-[100px]"
                />
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="px-8 font-bold"
              loading={isSubmitting}
            >
              Save Profile Updates
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default DoctorProfile;
