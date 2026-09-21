import { Router } from "express";
import productComparisonController from "../controllers/productComparisonController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiComparisonRateLimiter } from "../middleware/rateLimiter.js";
import {
  compareProductsValidator,
  validateRequest
} from "../validators/productComparisonValidators.js";

const router = Router();

/**
 * @route   POST /api/ai/compare
 * @desc    Compare 2 to 4 products with authoritative catalog facts and AI explanation
 * @access  Private
 */
router.post(
  "/",
  protect,
  aiComparisonRateLimiter,
  compareProductsValidator,
  validateRequest,
  productComparisonController.compareProducts
);

export default router;
