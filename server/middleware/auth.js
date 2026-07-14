const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes by checking and verifying JWT tokens in Authorization headers.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
      data: null,
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Session is invalid. User no longer exists.',
        data: null,
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
        data: null,
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or token is invalid.',
      data: null,
    });
  }
};

/**
 * Limit access to specific user roles.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        data: null,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource.`,
        data: null,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
