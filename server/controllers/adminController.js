const User = require('../models/User');

/**
 * Admin creates a Doctor user.
 * @route POST /api/admin/doctors
 * @access Private/Admin
 */
const createDoctor = async (req, res) => {
  try {
    const { name, email, phone, password, gender } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, and temporary password.',
        data: null,
      });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
        data: null,
      });
    }

    // Create the Doctor account in the Users collection
    // Default to 'male' if gender is not supplied, since it is a required field.
    const user = await User.create({
      name,
      email,
      phone,
      password,
      gender: gender || 'male',
      role: 'doctor',
      isActive: true,
    });

    if (user) {
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      };

      return res.status(201).json({
        success: true,
        message: 'Doctor account created successfully.',
        data: userResponse,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to create doctor account. Invalid inputs.',
        data: null,
      });
    }
  } catch (error) {
    console.error(`Create Doctor Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error creating doctor account.',
      data: null,
    });
  }
};

/**
 * List Doctor user accounts (placeholder implementation).
 * @route GET /api/admin/doctors
 * @access Private/Admin
 */
const listDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    
    return res.status(200).json({
      success: true,
      message: 'Doctor accounts retrieved successfully.',
      data: doctors,
    });
  } catch (error) {
    console.error(`List Doctors Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error listing doctor accounts.',
      data: null,
    });
  }
};

module.exports = {
  createDoctor,
  listDoctors,
};
