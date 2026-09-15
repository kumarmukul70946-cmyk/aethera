import mongoose from "mongoose";
import Review from "../models/Review.js";
import ReviewHelpful from "../models/ReviewHelpful.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import interactionService from "./interactionService.js";
import reviewSummaryService from "./reviewSummaryService.js";

/**
 * Review Service
 * Encapsulates all business logic for product reviews, verified purchase checks,
 * rating aggregation, helpful voting, and moderation.
 */

/**
 * Check if an authenticated user is eligible to review a product.
 * Requires an order owned by the user that contains the product and reached DELIVERED status.
 */
export const checkEligibility = async (userId, productId) => {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const existingReview = await Review.findOne({ user: userId, product: productId }).lean();

  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const productObjectId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;

  const deliveredOrder = await Order.findOne({
    user: userObjectId,
    $or: [{ status: "DELIVERED" }, { orderStatus: "DELIVERED" }],
    "items.product": productObjectId
  }).lean();

  return {
    canReview: Boolean(deliveredOrder && !existingReview),
    hasDeliveredOrder: Boolean(deliveredOrder),
    alreadyReviewed: Boolean(existingReview),
    existingReview: existingReview || null
  };
};

/**
 * Create a verified review.
 * Server verifies that the order exists, is delivered, and contains the product.
 */
export const createReview = async (userId, productId, { rating, comment }) => {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    const error = new Error("Product not found or is no longer active");
    error.statusCode = 404;
    throw error;
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({ user: userId, product: productId });
  if (existingReview) {
    const error = new Error(
      "You have already submitted a review for this product. Please update your existing review instead."
    );
    error.statusCode = 400;
    throw error;
  }

  // Verify delivered purchase
  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const productObjectId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;

  const order = await Order.findOne({
    user: userObjectId,
    $or: [{ status: "DELIVERED" }, { orderStatus: "DELIVERED" }],
    "items.product": productObjectId
  });

  if (!order) {
    const error = new Error(
      "Only customers who have purchased this product and received delivery can submit a verified review."
    );
    error.statusCode = 403;
    throw error;
  }

  // Create review with server-controlled properties
  const review = await Review.create({
    user: userId,
    product: productId,
    order: order._id,
    rating: Number(rating),
    comment: comment.trim(),
    verifiedPurchase: true,
    isApproved: true,
    helpfulCount: 0
  });

  // Synchronize product catalog rating and count
  await recalculateProductRating(productId);

  // Invalidate cached AI review summary for this product (lazy regeneration)
  reviewSummaryService.invalidateSummary(productId);

  // Record server-side RATING interaction for behavioral preference modeling
  interactionService
    .createInteraction({
      userId,
      productId,
      type: "RATING",
      metadata: {
        reviewId: review._id,
        rating: Number(rating),
        verifiedPurchase: true
      }
    })
    .catch((err) =>
      console.warn("[ReviewService] Tracking rating interaction failed:", err.message)
    );

  await review.populate("user", "name avatar");
  return review;
};

/**
 * Update an existing review.
 * Enforces ownership: only the review author can update rating and comment.
 */
export const updateReview = async (userId, reviewId, { rating, comment }) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  if (review.user.toString() !== userId.toString()) {
    const error = new Error("You are not authorized to update another customer's review");
    error.statusCode = 403;
    throw error;
  }

  if (rating !== undefined) {
    review.rating = Number(rating);
  }

  if (comment !== undefined) {
    review.comment = comment.trim();
  }

  await review.save();

  // Recalculate rating in case score changed
  await recalculateProductRating(review.product);

  // Invalidate cached AI review summary for this product
  reviewSummaryService.invalidateSummary(review.product);

  // Record server-side updated RATING interaction if rating changed
  if (rating !== undefined) {
    interactionService
      .createInteraction({
        userId,
        productId: review.product,
        type: "RATING",
        metadata: {
          reviewId: review._id,
          rating: Number(rating),
          isUpdate: true
        }
      })
      .catch((err) =>
        console.warn("[ReviewService] Tracking rating interaction failed:", err.message)
      );
  }

  await review.populate("user", "name avatar");
  return review;
};

/**
 * Delete a review.
 * Allowed for the review author or an administrator.
 */
export const deleteReview = async (userId, reviewId, isAdmin = false) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  if (!isAdmin && review.user.toString() !== userId.toString()) {
    const error = new Error("You are not authorized to delete another customer's review");
    error.statusCode = 403;
    throw error;
  }

  const productId = review.product;

  await Review.findByIdAndDelete(reviewId);
  await ReviewHelpful.deleteMany({ review: reviewId });

  // Recalculate product rating after deletion
  await recalculateProductRating(productId);

  // Invalidate cached AI review summary for this product
  reviewSummaryService.invalidateSummary(productId);

  return { message: "Review deleted successfully" };
};

/**
 * Fetch approved reviews for a product with pagination, filtering, and controlled sorting.
 */
export const getProductReviews = async (productId, query = {}) => {
  const filter = {
    product: productId,
    isApproved: true
  };

  if (query.rating) {
    const r = parseInt(query.rating, 10);
    if (r >= 1 && r <= 5) {
      filter.rating = r;
    }
  }

  // Controlled sort mapping
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1, createdAt: -1 },
    lowest: { rating: 1, createdAt: -1 },
    helpful: { helpfulCount: -1, createdAt: -1 }
  };

  const sortOption = sortMap[query.sort] || sortMap.newest;

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("user", "name avatar")
      .lean(),
    Review.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

/**
 * Calculate review summary metrics via MongoDB aggregation.
 * Generates true average rating, total approved reviews, and breakdown distribution (1-5 stars).
 */
export const getReviewSummary = async (productId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isApproved: true
      }
    },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 }
      }
    }
  ]);

  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  let totalReviews = 0;
  let totalScore = 0;

  for (const item of stats) {
    if (distribution[item._id] !== undefined) {
      distribution[item._id] = item.count;
      totalReviews += item.count;
      totalScore += item._id * item.count;
    }
  }

  const averageRating = totalReviews > 0 ? Math.round((totalScore / totalReviews) * 10) / 10 : 0;

  return {
    averageRating,
    totalReviews,
    distribution
  };
};

/**
 * Synchronize Product.rating and Product.reviewCount based on approved reviews.
 */
export const recalculateProductRating = async (productId) => {
  const summary = await getReviewSummary(productId);

  await Product.findByIdAndUpdate(productId, {
    rating: summary.averageRating,
    reviewCount: summary.totalReviews
  });

  return summary;
};

/**
 * Mark a review as helpful.
 * Enforces single-vote guarantee per user per review using ReviewHelpful.
 */
export const markReviewHelpful = async (userId, reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  try {
    await ReviewHelpful.create({
      user: userId,
      review: reviewId
    });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error("You have already marked this review as helpful");
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { $inc: { helpfulCount: 1 } },
    { new: true }
  );

  return {
    reviewId,
    helpfulCount: updatedReview.helpfulCount
  };
};

/**
 * Admin: Moderate a review's approval status.
 */
export const moderateReview = async (reviewId, isApproved) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  review.isApproved = Boolean(isApproved);
  await review.save();

  // Approved status affects public ratings
  await recalculateProductRating(review.product);

  // Invalidate cached AI review summary for this product
  reviewSummaryService.invalidateSummary(review.product);

  await review.populate("user", "name avatar");
  await review.populate("product", "name slug");
  return review;
};

/**
 * Admin: List all reviews across products with filters and pagination.
 */
export const getAllReviewsAdmin = async (query = {}) => {
  const filter = {};

  if (query.isApproved !== undefined) {
    filter.isApproved = query.isApproved === "true";
  }

  if (query.productId) {
    filter.product = query.productId;
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email avatar")
      .populate("product", "name slug images")
      .lean(),
    Review.countDocuments(filter)
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

export default {
  checkEligibility,
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getReviewSummary,
  recalculateProductRating,
  markReviewHelpful,
  moderateReview,
  getAllReviewsAdmin
};
