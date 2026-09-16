import authService from "../services/authService.js";
import { getAuthCookieOptions, getClearCookieOptions } from "../utils/cookieOptions.js";

/**
 * Register a new customer.
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });

    // Set JWT in secure HTTP-only cookie
    res.cookie("token", token, getAuthCookieOptions());

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user and issue secure JWT cookie.
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    // Set JWT in secure HTTP-only cookie
    res.cookie("token", token, getAuthCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth sign-in / sign-up.
 * @route POST /api/auth/google
 * @access Public
 */
export const googleLogin = async (req, res, next) => {
  try {
    const { credential, email, name, avatar, googleId } = req.body;
    const { user, token } = await authService.googleLoginUser({
      credential,
      email,
      name,
      avatar,
      googleId
    });

    // Set JWT in secure HTTP-only cookie
    res.cookie("token", token, getAuthCookieOptions());

    res.status(200).json({
      success: true,
      message: "Google sign-in successful",
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user and clear authentication cookie.
 * @route POST /api/auth/logout
 * @access Protected
 */
export const logout = async (req, res) => {
  res.clearCookie("token", getClearCookieOptions());

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

/**
 * Get current authenticated user details.
 * @route GET /api/auth/me
 * @access Protected
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user's profile (name, avatar).
 * @route PUT /api/auth/profile
 * @access Protected
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await authService.updateUserProfile(req.user._id, { name, avatar });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change authenticated user's password.
 * @route PUT /api/auth/change-password
 * @access Protected
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changeUserPassword(req.user._id, { currentPassword, newPassword });

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test endpoint to verify admin role authorization.
 * @route GET /api/auth/admin-check
 * @access Protected (Admin only)
 */
export const adminCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin authorization verified successfully",
    data: {
      admin: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
};

export default {
  register,
  login,
  googleLogin,
  logout,
  getMe,
  updateProfile,
  changePassword,
  adminCheck
};
