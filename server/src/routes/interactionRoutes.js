import { Router } from "express";
import interactionController from "../controllers/interactionController.js";
import { createInteractionValidator } from "../validators/interactionValidators.js";
import { validateRequest } from "../validators/authValidators.js";
import { optionalProtect } from "../middleware/authMiddleware.js";
import { interactionRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

/**
 * Public client interaction tracking endpoint.
 * Protected with rate limiting, optional JWT authentication (attaches req.user if logged in),
 * schema validation, and spoofing prevention.
 */
router.post(
  "/",
  interactionRateLimiter,
  optionalProtect,
  createInteractionValidator,
  validateRequest,
  interactionController.trackInteraction
);

export default router;
