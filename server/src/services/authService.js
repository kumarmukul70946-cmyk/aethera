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

/**
 * Authenticate or register a user via Google OAuth credential / profile.
 */
export const googleLoginUser = async ({ credential, email, name, avatar, googleId }) => {
  let userEmail = email;
  let userName = name;
  let userAvatar = avatar;
  let userGoogleId = googleId;

  // If a JWT credential token from Google Identity Services is provided, decode payload
  if (credential && typeof credential === "string") {
    try {
      const parts = credential.split(".");
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
        const payload = JSON.parse(payloadJson);
        if (payload.email) userEmail = payload.email;
        if (payload.name) userName = payload.name;
        if (payload.picture) userAvatar = payload.picture;
        if (payload.sub) userGoogleId = payload.sub;
      }
    } catch (e) {
      console.warn("Failed to decode Google credential JWT:", e.message);
    }
  }

  if (!userEmail) {
    const error = new Error("Google account email is required.");
    error.statusCode = 400;
    throw error;
  }

  userEmail = userEmail.toLowerCase().trim();
  if (!userGoogleId) {
    userGoogleId = `google_${Buffer.from(userEmail).toString("hex").slice(0, 16)}`;
  }

  // 1. Search for existing user with googleId
  let user = await User.findOne({ googleId: userGoogleId });

  // 2. If not found by googleId, check by email to link accounts
  if (!user) {
    user = await User.findOne({ email: userEmail });
    if (user) {
      user.googleId = userGoogleId;
      if (!user.authProvider || user.authProvider === "local") {
        user.authProvider = "google";
      }
      if (!user.avatar && userAvatar) {
        user.avatar = userAvatar;
      }
      await user.save();
    }
  }

  // 3. If still not found, create new customer user
  if (!user) {
    user = await User.create({
      name: userName || userEmail.split("@")[0],
      email: userEmail,
      googleId: userGoogleId,
      authProvider: "google",
      avatar: userAvatar || "",
      role: "customer"
    });
  }

  const token = generateToken(user);

  return {
    user: formatSafeUser(user),
    token
  };
};

export default {
  registerUser,
  loginUser,
  googleLoginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword
};
