import React, { useState } from 'react';
import { authService } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Add Doctor Panel for Admins to Register Doctor user profiles.
 */
const AddDoctor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    experience: '',
    hospital: '',
    consultationFee: '',
    availableDays: '',
    availableSlots: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,14}$/;

    if (!formData.name.trim()) newErrors.name = 'Doctor name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(formData.phone.replace(/[\s-()]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone (10-14 digits).';
    }
    if (!formData.password) {
      newErrors.password = 'Temporary password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    
    // Qualification, Specialization, etc. are details stored later but validated here if required
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required.';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required.';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required.';
    if (!formData.hospital.trim()) newErrors.hospital = 'Hospital name is required.';
    if (!formData.consultationFee.trim()) newErrors.consultationFee = 'Consultation fee is required.';
    if (!formData.availableDays.trim()) newErrors.availableDays = 'Available days is required.';
    if (!formData.availableSlots.trim()) newErrors.availableSlots = 'Available slots is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Backend expects User properties. For gender, we default to 'male' if not specified.
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: 'male', // default fallback for User schema requirement
        // Extra info passes to API placeholder:
        qualification: formData.qualification,
        specialization: formData.specialization,
        experience: formData.experience,
        hospital: formData.hospital,
        consultationFee: formData.consultationFee,
        availableDays: formData.availableDays.split(',').map(d => d.trim()).filter(Boolean),
        availableSlots: formData.availableSlots.split(',').map(s => s.trim()).filter(Boolean),
      };

      const result = await authService.createDoctor(payload);

      if (result.success) {
        setSuccessMessage(`Doctor account for "${formData.name}" created successfully!`);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          qualification: '',
          specialization: '',
          experience: '',
          hospital: '',
          consultationFee: '',
          availableDays: '',
          availableSlots: '',
          password: '',
        });
      } else {
        setErrorMessage(result.message || 'Failed to create doctor account.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred during doctor registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Add New Doctor</h1>
          <p className="text-sm text-slate-500">Create a secure medical practitioner account for the platform.</p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm" role="alert">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-250 text-red-800 p-4 rounded-xl text-sm" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section: Credentials */}
          <div className="md:col-span-2 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Account Credentials</h3>
          </div>

          <Input
            label="Doctor Name"
            name="name"
            placeholder="e.g. Dr. Jane Smith"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="e.g. dr.smith@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />

          <Input
            label="Temporary Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          {/* Section: Medical Profile */}
          <div className="md:col-span-2 border-b border-slate-100 pt-4 pb-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Medical Practice Details</h3>
          </div>

          <Input
            label="Qualification"
            name="qualification"
            placeholder="e.g. MBBS, MD (Cardiology)"
            value={formData.qualification}
            onChange={handleChange}
            error={errors.qualification}
            required
          />

          <Input
            label="Specialization"
            name="specialization"
            placeholder="e.g. Cardiologist"
            value={formData.specialization}
            onChange={handleChange}
            error={errors.specialization}
            required
          />

          <Input
            label="Experience (Years)"
            name="experience"
            placeholder="e.g. 10"
            value={formData.experience}
            onChange={handleChange}
            error={errors.experience}
            required
          />

          <Input
            label="Hospital / Clinic"
            name="hospital"
            placeholder="e.g. City General Hospital"
            value={formData.hospital}
            onChange={handleChange}
            error={errors.hospital}
            required
          />

          <Input
            label="Consultation Fee ($)"
            name="consultationFee"
            type="number"
            placeholder="e.g. 100"
            value={formData.consultationFee}
            onChange={handleChange}
            error={errors.consultationFee}
            required
          />

          <Input
            label="Available Days"
            name="availableDays"
            placeholder="e.g. Mon, Wed, Fri"
            value={formData.availableDays}
            onChange={handleChange}
            error={errors.availableDays}
            required
          />

          <Input
            label="Available Slots"
            name="availableSlots"
            placeholder="e.g. 09:00 AM - 12:00 PM, 02:00 PM - 05:00 PM"
            className="md:col-span-2"
            value={formData.availableSlots}
            onChange={handleChange}
            error={errors.availableSlots}
            required
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="px-6 font-bold text-sm tracking-wide gap-1.5"
          >
            Create Doctor Account
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddDoctor;
