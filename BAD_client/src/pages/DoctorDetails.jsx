import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowLeft, 
  Star, 
  User, 
  Stethoscope, 
  Calendar, 
  Clock, 
  Activity 
} from 'lucide-react';

/**
 * Public Doctor Detail Profile Page.
 */
const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await authService.getDoctorById(id);
        if (response.success && response.data) {
          setDoctor(response.data);
        } else {
          setError(response.message || 'Doctor profile not found.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading the doctor profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-500">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Container className="max-w-md text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-150 space-y-4">
          <h2 className="text-xl font-bold text-rose-600">Error Occurred</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{error || 'Unable to retrieve doctor profile details.'}</p>
          <Link to="/doctors">
            <Button variant="primary" size="sm" className="mt-2 flex items-center gap-1.5 mx-auto">
              <ArrowLeft className="w-4 h-4" /> Back to Doctors List
            </Button>
          </Link>
        </Container>
      </div>
    );
  }

  const profile = doctor.doctorProfile || {};
  const docName = doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;

  const handleBookingRedirect = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'patient') {
      navigate(`/patient/book?doctor=${doctor._id}`);
    } else {
      alert('Only registered patients can book consultation appointments.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 xl:py-16">
      <Container className="max-w-4xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link to="/doctors" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-650 hover:text-blue-800 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Available Doctors
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 sm:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Avatar frame */}
          <div className="md:col-span-1 flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-blue-50 bg-blue-50/50 flex items-center justify-center shrink-0">
              {doctor.profileImage ? (
                <img src={doctor.profileImage} alt={docName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-blue-400" />
              )}
            </div>
          </div>

          {/* Core metadata */}
          <div className="md:col-span-3 space-y-3 text-center md:text-left">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">{docName}</h1>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">{profile.specialization || 'Medical Specialist'}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-bold text-gray-800">{profile.rating?.toFixed(1) || '0.0'}</span>
                <span>({profile.totalReviews || 0} reviews)</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Accepting Appointments</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed italic max-w-xl">
              "{profile.about || 'Dedicated healthcare practitioner committed to providing premium quality medical care for all patients.'}"
            </p>
          </div>
        </div>

        {/* Detailed Grid panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Details Sheet */}
          <div className="md:col-span-2 space-y-6">
            {/* Professional Credentials Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" /> Professional Qualifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-400">Qualifying Degrees</span>
                  <p className="font-bold text-gray-800">{profile.qualification}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-400">Clinical Experience</span>
                  <p className="font-bold text-gray-800">{profile.experience} Years of Practice</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-400">Primary Hospital / Clinic</span>
                  <p className="font-bold text-gray-800">{profile.hospital}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-400">Consultation Fee</span>
                  <p className="font-bold text-gray-800">${profile.consultationFee}</p>
                </div>
              </div>
            </div>

            {/* About bio card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
              <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">
                Clinical Biography
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {profile.about || 'Dr. ' + doctor.name + ' specializes in ' + profile.specialization + ' at ' + profile.hospital + '. With over ' + profile.experience + ' years of dedicated practice, ' + docName + ' is focused on helping patients manage complex conditions and recover quickly. Consultation hours and scheduling slots are verified.'}
              </p>
            </div>

            {/* Reviews list card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Patient Reviews ({doctor.reviews?.length || 0})
              </h3>
              
              {!doctor.reviews || doctor.reviews.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No feedback reviews submitted yet for this doctor.</p>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {doctor.reviews.map((rev) => (
                    <div key={rev._id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {rev.patientId?.profileImage ? (
                              <img src={rev.patientId.profileImage} alt={rev.patientId?.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{rev.patientId?.name || 'Anonymous'}</p>
                            <p className="text-[10px] text-slate-405 font-semibold">{new Date(rev.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>

                      {rev.review && (
                        <p className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                          "{rev.review}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Appointment slots panel */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Available Hours
              </h3>
              
              {/* Days list */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Days of Week</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.availableDays && profile.availableDays.length > 0 ? (
                    profile.availableDays.map((day) => (
                      <span key={day} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
                        {day}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">Contact admin for schedules</span>
                  )}
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Appointment Slots
                </span>
                <div className="space-y-1.5">
                  {profile.availableSlots && profile.availableSlots.length > 0 ? (
                    profile.availableSlots.map((slot) => (
                      <div key={slot} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-100 truncate">
                        {slot}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-505">No slots configured</div>
                  )}
                </div>
              </div>

              {/* Booking trigger */}
              <div className="pt-4 border-t border-gray-100">
                <Button 
                  variant="primary" 
                  className="w-full font-bold text-sm tracking-wide"
                  onClick={handleBookingRedirect}
                >
                  Schedule Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DoctorDetails;
