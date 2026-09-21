import { Router } from "express";
import aiCustomizationController from "../controllers/aiCustomizationController.js";
import { aiCustomizationRateLimiter } from "../middleware/rateLimiter.js";
import {
  customizationIntentValidator,
  validateCustomizationRequest
} from "../validators/aiCustomizationValidators.js";

const router = Router();

/**
 * @route   POST /api/ai/customize
 * @desc    Translate natural language into validated 3D customization commands
 * @access  Private (inherits protect from aiRoutes)
 */
router.post(
  "/",
  aiCustomizationRateLimiter,
  customizationIntentValidator,
  validateCustomizationRequest,
  aiCustomizationController.customize
);

export default router;
