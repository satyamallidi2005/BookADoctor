const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * Register a new patient.
 * @route POST /api/auth/register
 * @access Public
 */
const registerPatient = async (req, res) => {
  try {
    const { name, email, phone, password, gender } = req.body;

    // 1. Required fields validation
    if (!name || !email || !phone || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, phone, password, gender) are required.',
        data: null,
      });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
        data: null,
      });
    }

    // 3. Phone number validation (10 to 14 digits)
    const cleanPhone = phone.replace(/[\s-()]/g, '');
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number (10-14 digits).',
        data: null,
      });
    }

    // 4. Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
        data: null,
      });
    }

    // 5. Gender check
    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be male, female, or other.',
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

    // Create the User as active patient
    const user = await User.create({
      name,
      email,
      phone,
      password,
      gender,
      role: 'patient',
      isActive: true,
    });

    if (user) {
      const token = generateToken(user._id);

      // Strip out password for client safety
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
        isActive: user.isActive,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(201).json({
        success: true,
        message: 'Registration successful.',
        data: {
          token,
          user: userResponse,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to create patient account. Invalid parameters.',
        data: null,
      });
    }
  } catch (error) {
    console.error(`Register Patient Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      data: null,
    });
  }
};

/**
 * Authenticate user and retrieve JWT token.
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
        data: null,
      });
    }

    // Retrieve user and select password (which is normally hidden)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: null,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact support.',
        data: null,
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: null,
      });
    }

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      role: user.role,
      isActive: user.isActive,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      data: null,
    });
  }
};

/**
 * Get profile of current logged-in user.
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
        data: null,
      });
    }

    let populatedUser = req.user;
    if (req.user.role === 'doctor') {
      populatedUser = await User.findById(req.user.id).populate('doctorProfile');
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: populatedUser,
    });
  } catch (error) {
    console.error(`Get Me Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile details.',
      data: null,
    });
  }
};

/**
 * Update profile of current logged-in user.
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
        data: null,
      });
    }

    const { name, phone, gender, profileImage, password } = req.body;

    if (name) user.name = name;
    if (gender) {
      if (!['male', 'female', 'other'].includes(gender)) {
        return res.status(400).json({
          success: false,
          message: 'Gender must be male, female, or other.',
          data: null,
        });
      }
      user.gender = gender;
    }
    if (phone) {
      const cleanPhone = phone.replace(/[\s-()]/g, '');
      const phoneRegex = /^\+?[0-9]{10,14}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid phone number (10-14 digits).',
          data: null,
        });
      }
      // Check phone uniqueness if modified
      if (cleanPhone !== user.phone) {
        const phoneExists = await User.findOne({ phone: cleanPhone });
        if (phoneExists) {
          return res.status(400).json({
            success: false,
            message: 'Phone number is already registered to another account.',
            data: null,
          });
        }
      }
      user.phone = cleanPhone;
    }
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters.',
          data: null,
        });
      }
      user.password = password;
    }

    await user.save();

    // Fetch refreshed user record
    const updatedUser = await User.findById(user._id);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    console.error(`Update Profile Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile details.',
      data: null,
    });
  }
};

module.exports = {
  registerPatient,
  login,
  getMe,
  updateProfile,
};
