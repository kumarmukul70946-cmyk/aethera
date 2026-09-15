import { Router } from "express";
import reviewController from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/authValidators.js";
import {
  productIdParamValidator,
  reviewIdParamValidator,
  createReviewValidator,
  updateReviewValidator,
  reviewQueryValidator,
  moderateReviewValidator
} from "../validators/reviewValidators.js";

// ── 1. Product-Nested Review Router (/api/products/:productId/reviews) ───────
export const productReviewRouter = Router({ mergeParams: true });

// Public: Get reviews for a product (paginated, sorted, filtered by rating)
productReviewRouter.get(
  "/",
  productIdParamValidator,
  reviewQueryValidator,
  validateRequest,
  reviewController.getProductReviews
);

// Public: Get review aggregation summary (average rating, distribution, total)
productReviewRouter.get(
  "/summary",
  productIdParamValidator,
  validateRequest,
  reviewController.getReviewSummary
);

// Protected: Check if authenticated customer can review this product
productReviewRouter.get(
  "/eligibility",
  protect,
  productIdParamValidator,
  validateRequest,
  reviewController.checkEligibility
);

// Protected: Submit verified review
productReviewRouter.post(
  "/",
  protect,
  createReviewValidator,
  validateRequest,
  reviewController.createReview
);

// ── 2. Direct Review Router (/api/reviews) ───────────────────────────────────
export const reviewRouter = Router();

// Protected: Update own review (rating, comment)
reviewRouter.put(
  "/:id",
  protect,
  updateReviewValidator,
  validateRequest,
  reviewController.updateReview
);

// Protected: Delete review (owner or admin)
reviewRouter.delete(
  "/:id",
  protect,
  reviewIdParamValidator,
  validateRequest,
  reviewController.deleteReview
);

// Protected: Mark review as helpful (one vote per user)
reviewRouter.post(
  "/:id/helpful",
  protect,
  reviewIdParamValidator,
  validateRequest,
  reviewController.markReviewHelpful
);

// ── 3. Admin Review Router (/api/admin/reviews) ──────────────────────────────
export const adminReviewRouter = Router();

// All admin routes require admin role
adminReviewRouter.use(protect, authorize("admin"));

// Admin: List all reviews across the system
adminReviewRouter.get("/", reviewController.getAllReviewsAdmin);

// Admin: Moderate review approval
adminReviewRouter.patch(
  "/:id/moderate",
  moderateReviewValidator,
  validateRequest,
  reviewController.moderateReview
);

// Admin: Delete review
adminReviewRouter.delete(
  "/:id",
  reviewIdParamValidator,
  validateRequest,
  reviewController.deleteReview
);

export default {
  productReviewRouter,
  reviewRouter,
  adminReviewRouter
};
