import { Router } from "express";
import authController from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  validateRequest
} from "../validators/authValidators.js";

const router = Router();

// Public routes
router.post(
  "/register",
  authRateLimiter,
  registerValidator,
  validateRequest,
  authController.register
);

router.post(
  "/login",
  authRateLimiter,
  loginValidator,
  validateRequest,
  authController.login
);

router.post(
  "/google",
  authRateLimiter,
  authController.googleLogin
);

// Protected routes (Customer & Admin)
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);

router.put(
  "/profile",
  protect,
  updateProfileValidator,
  validateRequest,
  authController.updateProfile
);

router.put(
  "/change-password",
  protect,
  changePasswordValidator,
  validateRequest,
  authController.changePassword
);

// Role-based protected route (Admin only)
router.get(
  "/admin-check",
  protect,
  authorize("admin"),
  authController.adminCheck
);

export default router;
