import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Authentication Middleware: protect
 * Verifies the incoming JWT from the HTTP-only cookie (or Authorization header),
 * validates that the user exists in MongoDB, and attaches the safe user object to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // Primary: Read from HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Secondary fallback: Read from Authorization header (Bearer token)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please log in to access this resource."
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again."
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token."
      });
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication verification failed."
    });
  }
};

/**
 * Optional Authentication Middleware: optionalAuth
 * Inspects incoming request for valid JWT session.
 * Sets req.user if authenticated, otherwise leaves req.user = null without throwing.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      req.user = user || null;
    } catch {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * Authorization Middleware: authorize
 * Restricts access to users with specified roles.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'customer')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated."
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this resource."
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware: optionalProtect
 * Checks if a JWT token is present in cookies or Authorization header.
 * If valid and user exists, sets req.user = user.
 * If no token is provided or the token is invalid, sets req.user = null and proceeds.
 * Never fails requests merely because an anonymous visitor is not logged in.
 * Never trusts client-provided user IDs.
 */
export const optionalProtect = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
      return next();
    }

    if (decoded && decoded.userId) {
      const user = await User.findById(decoded.userId).select("-password");
      req.user = user || null;
    } else {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
};

export default { protect, authorize, optionalProtect };


