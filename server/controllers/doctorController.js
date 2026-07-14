const doctorService = require('../services/doctorService');
const User = require('../models/User');

/**
 * Admin: Create a new Doctor user and profile.
 */
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      qualification,
      specialization,
      experience,
      hospital,
      consultationFee,
      availableDays,
      availableSlots,
    } = req.body;

    // 1. Validate required fields
    if (
      !name || !email || !phone || !password || !qualification || 
      !specialization || !experience || !hospital || !consultationFee || 
      !availableDays || !availableSlots
    ) {
      return res.status(400).json({
        success: false,
        message: 'All registration parameters are required.',
        data: null,
      });
    }

    // 2. Validate data types
    if (isNaN(Number(experience)) || Number(experience) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Experience must be a positive number.',
        data: null,
      });
    }

    if (isNaN(Number(consultationFee)) || Number(consultationFee) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Consultation fee must be a positive number.',
        data: null,
      });
    }

    if (!Array.isArray(availableDays)) {
      return res.status(400).json({
        success: false,
        message: 'Available days must be an array format.',
        data: null,
      });
    }

    if (!Array.isArray(availableSlots)) {
      return res.status(400).json({
        success: false,
        message: 'Available slots must be an array format.',
        data: null,
      });
    }

    // 3. Validate email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
        data: null,
      });
    }

    // 4. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
        data: null,
      });
    }

    // 5. Enforce unique Email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'This email is already in use.',
        data: null,
      });
    }

    // 6. Enforce unique Phone
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered.',
        data: null,
      });
    }

    const doctor = await doctorService.createDoctor(req.body);

    return res.status(201).json({
      success: true,
      message: 'Doctor account registered successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Doctor's basic properties and profile stats.
 */
const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      email,
      phone,
      experience,
      consultationFee,
      availableDays,
      availableSlots,
    } = req.body;

    // Validate type constraints if supplied
    if (experience !== undefined && (isNaN(Number(experience)) || Number(experience) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Experience must be a positive number.',
        data: null,
      });
    }

    if (consultationFee !== undefined && (isNaN(Number(consultationFee)) || Number(consultationFee) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Consultation fee must be a positive number.',
        data: null,
      });
    }

    if (availableDays !== undefined && !Array.isArray(availableDays)) {
      return res.status(400).json({
        success: false,
        message: 'Available days must be an array.',
        data: null,
      });
    }

    if (availableSlots !== undefined && !Array.isArray(availableSlots)) {
      return res.status(400).json({
        success: false,
        message: 'Available slots must be an array.',
        data: null,
      });
    }

    // Check unique email
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
          data: null,
        });
      }

      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already taken by another account.',
          data: null,
        });
      }
    }

    // Check unique phone
    if (phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: id } });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already registered to another account.',
          data: null,
        });
      }
    }

    const doctor = await doctorService.updateDoctor(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Doctor details updated successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Toggle Doctor active status (Soft Delete / Reactivation).
 */
const toggleDoctorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await doctorService.toggleDoctorStatus(id);
    return res.status(200).json({
      success: true,
      message: `Doctor is now ${doctor.isActive ? 'Active' : 'Inactive'}.`,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Reset Doctor temporary password.
 */
const resetDoctorPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
        data: null,
      });
    }

    await doctorService.resetDoctorPassword(id, password);
    
    return res.status(200).json({
      success: true,
      message: 'Doctor password reset successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Retrieve only Active Doctors list.
 */
const getAvailableDoctors = async (req, res, next) => {
  try {
    const doctors = await doctorService.getAvailableDoctors();
    return res.status(200).json({
      success: true,
      message: 'Active doctors retrieved successfully.',
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Get dynamic detail view of single doctor.
 */
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await doctorService.getDoctorById(id);
    return res.status(200).json({
      success: true,
      message: 'Doctor profile loaded successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List all Doctor users with basic search filters.
 */
const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await doctorService.getAllDoctorsForAdmin(req.query.search);
    return res.status(200).json({
      success: true,
      message: 'Admin doctors list loaded successfully.',
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

const updateOwnDoctorProfile = async (req, res, next) => {
  try {
    const { 
      name, phone, gender, profileImage,
      qualification, specialization, experience, hospital, consultationFee,
      availableDays, availableSlots, about 
    } = req.body;

    if (availableDays !== undefined && !Array.isArray(availableDays)) {
      return res.status(400).json({
        success: false,
        message: 'Available days must be an array.',
        data: null,
      });
    }

    if (availableSlots !== undefined && !Array.isArray(availableSlots)) {
      return res.status(400).json({
        success: false,
        message: 'Available slots must be an array.',
        data: null,
      });
    }

    if (phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: req.user.id } });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already registered to another account.',
          data: null,
        });
      }
    }

    const updateData = {
      name, phone, gender, profileImage,
      qualification, specialization, experience, hospital, consultationFee,
      availableDays, availableSlots, about
    };

    const doctor = await doctorService.updateDoctor(req.user.id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Doctor profile and availability updated successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: Load booked/occupied slot times for a doctor on a specific date.
 */
const getBookedSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date query parameter is required.',
        data: null,
      });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const Booking = require('../models/Appointment');
    const appointments = await Booking.find({
      doctorId: id,
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['pending', 'accepted', 'completed'] }
    });

    const bookedTimes = appointments.map(a => a.appointmentTime);

    return res.status(200).json({
      success: true,
      message: 'Booked slots loaded successfully.',
      data: bookedTimes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  resetDoctorPassword,
  getAvailableDoctors,
  getDoctorById,
  getAllDoctors,
  updateOwnDoctorProfile,
  getBookedSlots,
};
