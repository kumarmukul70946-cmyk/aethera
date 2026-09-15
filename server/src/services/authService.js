import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

/**
 * Format a user document into a safe user payload without sensitive fields.
 */
const formatSafeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * Register a new customer user.
 * Public registration is strictly locked to role: "customer".
 */
export const registerUser = async ({ name, email, password }) => {
  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user with forced customer role
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "customer" // Always force customer role for public registration
  });

  const token = generateToken(user);

  return {
    user: formatSafeUser(user),
    token
  };
};

/**
 * Authenticate an existing user with email and password.
 */
export const loginUser = async ({ email, password }) => {
  // Explicitly include password because schema sets select: false
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Verify password with bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: formatSafeUser(user),
    token
  };
};

/**
 * Retrieve the current authenticated user's profile.
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return formatSafeUser(user);
};

/**
 * Update authenticated user's profile (name, avatar).
 * Forbids role or password modifications.
 */
export const updateUserProfile = async (userId, { name, avatar }) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (name !== undefined) user.name = name.trim();
  if (avatar !== undefined) user.avatar = avatar.trim();

  await user.save();

  return formatSafeUser(user);
};

/**
 * Change authenticated user's password.
 */
export const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error("Current password is incorrect.");
    error.statusCode = 400;
    throw error;
  }

  // Hash new password
  const saltRounds = 12;
  user.password = await bcrypt.hash(newPassword, saltRounds);
  await user.save();

  return true;
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword
};
