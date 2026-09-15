import { Router } from "express";
import semanticSearchController from "../controllers/semanticSearchController.js";
import { semanticSearchValidator } from "../validators/semanticSearchValidators.js";
import { validateRequest } from "../validators/authValidators.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * @route GET /api/search/semantic
 * @access Public (optional authentication for interaction tracking)
 */
router.get(
  "/semantic",
  optionalAuth,
  semanticSearchValidator,
  validateRequest,
  semanticSearchController.searchSemantic
);

export default router;
