import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, MapPin, Award, DollarSign, Stethoscope, Filter } from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import SectionTitle from '../components/common/SectionTitle';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

/**
 * Public Doctors listing page — /doctors
 * Shows all available verified doctors with search + specialisation filter.
 */
const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await authService.getAvailableDoctors();
        if (response.success && response.data) {
          setDoctors(response.data);
        } else {
          setError(response.message || 'Failed to fetch doctors.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading available doctors.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Build unique specializations list for filter dropdown
  const specializations = [...new Set(
    doctors
      .map(d => d.doctorProfile?.specialization)
      .filter(Boolean)
  )].sort();

  // Filter doctors by search text and/or specialization
  const filtered = doctors.filter(doc => {
    const prof = doc.doctorProfile || {};
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      doc.name.toLowerCase().includes(term) ||
      (prof.specialization && prof.specialization.toLowerCase().includes(term)) ||
      (prof.hospital && prof.hospital.toLowerCase().includes(term));
    const matchesSpec =
      !specialization || prof.specialization === specialization;
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Hero Banner */}
      <div className="bg-white border-b border-gray-100">
        <Container className="pt-10 pb-8">
          <SectionTitle
            subtitle="Our Medical Team"
            title="Find Your Doctor"
            align="center"
          />

          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-2">
            {/* Search input */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, specialty, or hospital..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Specialization filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="">All Specializations</option>
                {specializations.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </Container>
      </div>

      {/* Doctors Grid */}
      <Container className="py-10">
        {loading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
                <div className="space-y-2 pt-3">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-semibold max-w-md mx-auto p-6">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No doctors found matching your search.</p>
            <button
              onClick={() => { setSearch(''); setSpecialization(''); }}
              className="mt-3 text-sm text-blue-600 font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 font-semibold mb-6">
              Showing <span className="text-gray-700 font-bold">{filtered.length}</span> doctor{filtered.length !== 1 ? 's' : ''}
              {specialization && <span> in <span className="text-blue-600">{specialization}</span></span>}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(doctor => {
                const profile = doctor.doctorProfile || {};
                const docName = doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;
                return (
                  <div
                    key={doctor._id}
                    className="bg-white border border-gray-100 hover:border-blue-200 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Avatar */}
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-blue-50 bg-blue-50/50 flex items-center justify-center">
                        {doctor.profileImage ? (
                          <img src={doctor.profileImage} alt={docName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-blue-400" />
                        )}
                      </div>

                      {/* Name + Specialization */}
                      <div className="text-center space-y-1">
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">{docName}</h3>
                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                          {profile.specialization || 'Specialist'}
                        </p>
                      </div>

                      <hr className="border-gray-100" />

                      {/* Details */}
                      <div className="space-y-2 text-[11px] text-gray-500">
                        <div className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>
                            <span className="font-semibold text-gray-700">Experience:</span>{' '}
                            {profile.experience || 0} Years
                          </span>
                        </div>
                        {profile.hospital && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">
                              <span className="font-semibold text-gray-700">Hospital:</span>{' '}
                              {profile.hospital}
                            </span>
                          </div>
                        )}
                        {profile.consultationFee && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>
                              <span className="font-semibold text-gray-700">Fee:</span>{' '}
                              ${profile.consultationFee}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-5 mt-5 border-t border-gray-100 shrink-0">
                      <Link to={`/doctors/${doctor._id}`} className="w-full">
                        <Button variant="secondary" size="sm" className="w-full text-xs font-bold py-2 border-gray-200">
                          View Profile
                        </Button>
                      </Link>
                      <Link
                        to={user ? `/patient/book?doctor=${doctor._id}` : '/login'}
                        className="w-full"
                      >
                        <Button variant="primary" size="sm" className="w-full text-xs font-bold py-2">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default AllDoctors;
