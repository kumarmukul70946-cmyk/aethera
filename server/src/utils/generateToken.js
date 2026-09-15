import jwt from "jsonwebtoken";

/**
 * Generate a signed JWT token.
 * The payload contains only non-sensitive claims: userId and role.
 *
 * @param {Object} user - User document or object with _id/id and role
 * @returns {string} Signed JSON Web Token
 */
export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured in environment variables.");
  }

  const payload = {
    userId: user._id || user.id,
    role: user.role
  };

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

export default generateToken;
