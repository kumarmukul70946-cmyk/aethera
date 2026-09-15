import { Router } from "express";
import reviewSummaryController from "../controllers/reviewSummaryController.js";
import { productIdParamValidator } from "../validators/reviewSummaryValidators.js";
import { validateRequest } from "../validators/authValidators.js";
import { aiReviewSummaryRateLimiter } from "../middleware/rateLimiter.js";

const router = Router({ mergeParams: true });

/**
 * GET /api/products/:productId/review-summary
 * Public customer-facing endpoint for AI-generated review intelligence.
 */
router.get(
  "/",
  aiReviewSummaryRateLimiter,
  productIdParamValidator,
  validateRequest,
  reviewSummaryController.getReviewSummary
);

export default router;
