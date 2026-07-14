import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AllDoctors from '../pages/AllDoctors';
import PatientDashboard from '../pages/PatientDashboard';
import DoctorDashboard from '../pages/DoctorDashboard';
import DoctorLayout from '../layouts/DoctorLayout';
import DoctorRequests from '../pages/DoctorRequests';
import DoctorToday from '../pages/DoctorToday';
import DoctorHistory from '../pages/DoctorHistory';
import DoctorAvailability from '../pages/DoctorAvailability';
import DoctorPatients from '../pages/DoctorPatients';
import DoctorProfile from '../pages/DoctorProfile';
import AdminDashboard from '../pages/AdminDashboard';
import AdminHome from '../pages/AdminHome';
import AddDoctor from '../pages/AddDoctor';
import ComingSoon from '../pages/ComingSoon';
import NotFound from '../pages/NotFound';
import PatientLayout from '../layouts/PatientLayout';
import PatientBook from '../pages/PatientBook';
import PatientAppointments from '../pages/PatientAppointments';
import PatientReports from '../pages/PatientReports';
import PatientNotifications from '../pages/PatientNotifications';
import PatientProfile from '../pages/PatientProfile';
import PatientSettings from '../pages/PatientSettings';
import DoctorDetails from '../pages/DoctorDetails';
import AdminDoctors from '../pages/AdminDoctors';
import AdminAppointments from '../pages/AdminAppointments';

/**
 * Main Application Routes config.
 * Handles public landing layout, centered authentication flow layout, and role-based protected dashboard routes.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with Header/Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/doctors" element={<AllDoctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
      </Route>

      {/* Centered Auth Flow without Header/Footer */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Patient Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="book" element={<PatientBook />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="reports" element={<PatientReports />} />
        <Route path="notifications" element={<PatientNotifications />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="settings" element={<PatientSettings />} />
      </Route>

      {/* Protected Doctor Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="today" element={<DoctorToday />} />
        <Route path="requests" element={<DoctorRequests />} />
        <Route path="history" element={<DoctorHistory />} />
        <Route path="availability" element={<DoctorAvailability />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="notifications" element={<PatientNotifications />} />
        <Route path="settings" element={<PatientSettings />} />
      </Route>

      {/* Protected Admin Routes with Sidebar navigation */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="add-doctor" element={<AddDoctor />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="patients" element={<ComingSoon title="Patients" />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="settings" element={<ComingSoon title="Settings" />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
