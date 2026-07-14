import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add authorization bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bad_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  /**
   * Log in user with credentials.
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // Expecting { success, message, data: { token, user } }
  },

  /**
   * Register a new patient.
   * @param {object} userData
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data; // Expecting { success, message, data: { token, user } }
  },

  /**
   * Fetch authenticated user's profile.
   */
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data; // Expecting { success, message, data: user }
  },

  /**
   * Admin: create a new doctor user account.
   * @param {object} doctorData
   */
  createDoctor: async (doctorData) => {
    const response = await api.post('/admin/doctors', doctorData);
    return response.data; // Expecting { success, message, data: doctorUser }
  },

  /**
   * Admin: fetch list of doctor user accounts with search filter.
   */
  getDoctors: async (search = '') => {
    const response = await api.get('/admin/doctors', { params: { search } });
    return response.data; // Expecting { success, message, data: doctorsList }
  },

  /**
   * Admin: update an existing doctor user details and profile.
   */
  updateDoctor: async (id, doctorData) => {
    const response = await api.put(`/admin/doctors/${id}`, doctorData);
    return response.data; // Expecting { success, message, data: doctorUser }
  },

  /**
   * Admin: toggle doctor's active status (Soft delete / Reactivate).
   */
  toggleDoctorStatus: async (id) => {
    const response = await api.patch(`/admin/doctors/${id}/status`);
    return response.data; // Expecting { success, message, data: doctorUser }
  },

  /**
   * Admin: reset a doctor's temporary password.
   */
  resetDoctorPassword: async (id, password) => {
    const response = await api.patch(`/admin/doctors/${id}/password`, { password });
    return response.data; // Expecting { success, message, data: null }
  },

  /**
   * Public: fetch active doctors only.
   */
  getAvailableDoctors: async () => {
    const response = await api.get('/doctors');
    return response.data; // Expecting { success, message, data: doctorsList }
  },

  /**
   * Public: get dynamic detail view of single doctor.
   */
  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data; // Expecting { success, message, data: doctorUser }
  },

  /**
   * Patient: Update profile fields.
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data; // Expecting { success, message, data: updatedUser }
  },

  /**
   * Patient: Retrieve list of appointments.
   */
  getAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data; // Expecting { success, message, data: appointmentsList }
  },

  /**
   * Patient: Retrieve single appointment detail sheet.
   */
  getAppointment: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data; // Expecting { success, message, data: appointmentDetail }
  },

  /**
   * Patient: Create an appointment booking.
   */
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data; // Expecting { success, message, data: appointmentDoc }
  },

  /**
   * Patient: Cancel an active appointment booking.
   */
  cancelAppointment: async (id, cancelReason = '') => {
    const response = await api.patch(`/appointments/${id}/cancel`, { cancelReason });
    return response.data; // Expecting { success, message, data: appointmentDoc }
  },

  /**
   * Patient: Get uploaded medical report sheets.
   */
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data; // Expecting { success, message, data: reportsList }
  },

  /**
   * Patient: Upload a new medical report (PDF, JPG, PNG).
   */
  uploadReport: async (formData) => {
    const response = await api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // Expecting { success, message, data: reportDoc }
  },

  /**
   * Patient: Delete a medical report record.
   */
  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data; // Expecting { success, message, data: null }
  },

  /**
   * User: Fetch user notification alerts.
   */
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data; // Expecting { success, message, data: notificationsList }
  },

  /**
   * User: Mark a specific notification read.
   */
  markNotificationRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data; // Expecting { success, message, data: notificationDoc }
  },

  /**
   * User: Mark all notifications read.
   */
  markAllNotificationsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data; // Expecting { success, message, data: null }
  },

  /**
   * Doctor: Fetch scheduled appointments.
   */
  getDoctorAppointments: async () => {
    const response = await api.get('/appointments/doctor');
    return response.data; // Expecting { success, message, data: appointmentsList }
  },

  /**
   * Doctor: Accept appointment request.
   */
  acceptAppointment: async (id) => {
    const response = await api.patch(`/appointments/${id}/accept`);
    return response.data; // Expecting { success, message, data: appointmentDoc }
  },

  /**
   * Doctor: Reject appointment request with reason.
   */
  rejectAppointment: async (id, rejectReason) => {
    const response = await api.patch(`/appointments/${id}/reject`, { rejectReason });
    return response.data; // Expecting { success, message, data: appointmentDoc }
  },

  /**
   * Doctor: Complete consultation, write notes and issues prescription.
   */
  completeAppointment: async (id, prescriptionData) => {
    const response = await api.post(`/appointments/${id}/complete`, prescriptionData);
    return response.data; // Expecting { success, message, data: appointmentDoc }
  },

  /**
   * Doctor: View patient's complete history timeline.
   */
  getPatientHistory: async (patientId) => {
    const response = await api.get(`/appointments/patient/${patientId}`);
    return response.data; // Expecting { success, message, data: historyList }
  },

  /**
   * Admin: View all appoinments in portal with queries.
   */
  getAllAppointmentsAdmin: async (params = {}) => {
    const response = await api.get('/appointments/admin', { params });
    return response.data; // Expecting { success, message, data: appointmentsList }
  },

  /**
   * Doctor: Update doctor self profile and availability settings.
   */
  updateDoctorProfile: async (profileData) => {
    const response = await api.put('/doctor/profile', profileData);
    return response.data; // Expecting { success, message, data: updatedDoctor }
  },

  /**
   * Patient: Load booked slots for doctor on a specific date.
   */
  getBookedSlots: async (doctorId, date) => {
    const response = await api.get(`/doctors/${doctorId}/booked-slots`, { params: { date } });
    return response.data; // Expecting { success, message, data: bookedTimes }
  },

  /**
   * Patient: Submit feedback review rating.
   */
  submitReview: async (appointmentId, reviewData) => {
    const response = await api.post(`/appointments/${appointmentId}/review`, reviewData);
    return response.data; // Expecting { success, message, data: appointment }
  }
};
