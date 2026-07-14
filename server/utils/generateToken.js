const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token for the given user ID.
 * @param {string} id - The MongoDB user ID.
 * @returns {string} The signed JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
