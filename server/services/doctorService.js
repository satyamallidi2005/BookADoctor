const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

/**
 * Creates a new Doctor account. 
 * Creates both a User identity and a DoctorProfile detail sheet transactionally.
 */
const createDoctor = async (doctorData) => {
  const session = await mongoose.startSession();
  let useTransaction = true;

  try {
    session.startTransaction();
  } catch (err) {
    useTransaction = false; // Fallback for standalone MongoDB deployments
  }

  let createdUser = null;
  let createdProfile = null;

  try {
    // 1. Create the base User
    const userData = {
      name: doctorData.name,
      email: doctorData.email,
      phone: doctorData.phone,
      password: doctorData.password,
      gender: doctorData.gender || 'male',
      role: 'doctor',
      isActive: true,
      profileImage: doctorData.profileImage || '',
    };

    const userOptions = useTransaction ? { session } : {};
    const userArray = await User.create([userData], userOptions);
    createdUser = userArray[0];

    // 2. Create the linked DoctorProfile
    const profileData = {
      userId: createdUser._id,
      qualification: doctorData.qualification,
      specialization: doctorData.specialization,
      experience: Number(doctorData.experience),
      hospital: doctorData.hospital,
      consultationFee: Number(doctorData.consultationFee),
      availableDays: doctorData.availableDays || [],
      availableSlots: doctorData.availableSlots || [],
      about: doctorData.about || '',
      profileImage: doctorData.profileImage || '',
      rating: 0,
      totalReviews: 0,
    };

    const profileOptions = useTransaction ? { session } : {};
    const profileArray = await DoctorProfile.create([profileData], profileOptions);
    createdProfile = profileArray[0];

    if (useTransaction) {
      await session.commitTransaction();
    }
    session.endSession();

    // Return combined object
    const userObj = createdUser.toObject();
    userObj.doctorProfile = createdProfile.toObject();
    return userObj;
  } catch (error) {
    if (useTransaction) {
      await session.abortTransaction();
    } else {
      // Manual cleanup fallback for standalone DB deployments to prevent orphan records
      if (createdUser) {
        await User.findByIdAndDelete(createdUser._id);
      }
      if (createdProfile) {
        await DoctorProfile.findByIdAndDelete(createdProfile._id);
      }
    }
    session.endSession();
    throw error;
  }
};

/**
 * Updates a Doctor's account and profile data.
 */
const updateDoctor = async (id, updateData) => {
  let session = null;
  const useTransaction = !!mongoose.supportsTransactions;

  if (useTransaction) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (err) {
      if (session) {
        session.endSession();
        session = null;
      }
    }
  }

  let originalUser = null;
  let originalProfile = null;

  try {
    const userOptions = useTransaction ? { session } : {};
    const profileOptions = useTransaction ? { session } : {};

    // Get backups for manual rollback if transactions are not active
    if (!useTransaction) {
      originalUser = await User.findById(id);
      originalProfile = await DoctorProfile.findOne({ userId: id });
    }

    // 1. Update basic User properties
    const userFields = {};
    if (updateData.name !== undefined) userFields.name = updateData.name;
    if (updateData.email !== undefined) userFields.email = updateData.email;
    if (updateData.phone !== undefined) userFields.phone = updateData.phone;
    if (updateData.gender !== undefined) userFields.gender = updateData.gender;
    if (updateData.profileImage !== undefined) userFields.profileImage = updateData.profileImage;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: userFields },
      { new: true, runValidators: true, ...userOptions }
    );

    if (!updatedUser) {
      throw new Error('Doctor account not found.');
    }

    // 2. Update specific DoctorProfile sheet
    let profile = await DoctorProfile.findOne({ userId: id }, null, profileOptions);
    if (!profile) {
      profile = new DoctorProfile({
        userId: id,
        qualification: 'Not specified',
        specialization: 'General Medicine',
        experience: 0,
        hospital: 'Not specified',
        consultationFee: 0,
      });
    }

    if (updateData.qualification !== undefined) profile.qualification = updateData.qualification;
    if (updateData.specialization !== undefined) profile.specialization = updateData.specialization;
    if (updateData.experience !== undefined) profile.experience = Number(updateData.experience);
    if (updateData.hospital !== undefined) profile.hospital = updateData.hospital;
    if (updateData.consultationFee !== undefined) profile.consultationFee = Number(updateData.consultationFee);
    if (updateData.availableDays !== undefined) profile.availableDays = updateData.availableDays;
    if (updateData.availableSlots !== undefined) profile.availableSlots = updateData.availableSlots;
    if (updateData.about !== undefined) profile.about = updateData.about;
    if (updateData.profileImage !== undefined) profile.profileImage = updateData.profileImage;

    const updatedProfile = await profile.save(profileOptions);

    if (useTransaction && session) {
      await session.commitTransaction();
      session.endSession();
    }

    const userObj = updatedUser.toObject();
    userObj.doctorProfile = updatedProfile.toObject();
    return userObj;
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
      session.endSession();
    } else {
      // Manual restoration rollback
      if (originalUser) {
        await User.findByIdAndUpdate(id, originalUser);
      }
      if (originalProfile) {
        await DoctorProfile.findOneAndUpdate({ userId: id }, originalProfile);
      }
    }
    throw error;
  }
};

/**
 * Toggles a Doctor's active status (Soft delete / Reactivate).
 */
const toggleDoctorStatus = async (id) => {
  const user = await User.findById(id);
  if (!user || user.role !== 'doctor') {
    throw new Error('Doctor account not found.');
  }

  user.isActive = !user.isActive;
  await user.save();
  return user;
};

/**
 * Resets a Doctor's password (Pre-save hook will automatically encrypt it).
 */
const resetDoctorPassword = async (id, newPassword) => {
  const user = await User.findById(id).select('+password');
  if (!user || user.role !== 'doctor') {
    throw new Error('Doctor account not found.');
  }

  user.password = newPassword;
  await user.save();
  return { success: true };
};

/**
 * Retrieves public list of active doctors with profile specs.
 */
const getAvailableDoctors = async () => {
  return await User.find({ role: 'doctor', isActive: true })
    .populate('doctorProfile')
    .select('-password');
};

/**
 * Retrieves full details of a doctor by User ID.
 */
const getDoctorById = async (id) => {
  const doctor = await User.findOne({ _id: id, role: 'doctor' })
    .populate('doctorProfile')
    .select('-password');
  
  if (!doctor) {
    throw new Error('Doctor profile not found.');
  }

  const Appointment = require('../models/Appointment');
  const reviews = await Appointment.find({
    doctorId: id,
    status: 'completed',
    rating: { $exists: true, $ne: null }
  })
    .populate('patientId', 'name profileImage')
    .select('rating review updatedAt');

  const doctorObj = doctor.toObject();
  doctorObj.reviews = reviews;
  return doctorObj;
};

/**
 * Retrieves all doctor accounts for Admin Management view, supporting simple searches.
 */
const getAllDoctorsForAdmin = async (searchQuery = '') => {
  const filter = { role: 'doctor' };
  
  if (searchQuery) {
    filter.$or = [
      { name: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } },
      { phone: { $regex: searchQuery, $options: 'i' } }
    ];
  }

  return await User.find(filter)
    .populate('doctorProfile')
    .select('-password');
};

module.exports = {
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  resetDoctorPassword,
  getAvailableDoctors,
  getDoctorById,
  getAllDoctorsForAdmin,
};
