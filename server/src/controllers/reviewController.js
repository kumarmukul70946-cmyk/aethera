import reviewService from "../services/reviewService.js";

/**
 * Review Controller
 * Handles HTTP requests for product reviews, verified checks, helpful votes, and moderation.
 */

export const checkEligibility = async (req, res, next) => {
  try {
    const eligibility = await reviewService.checkEligibility(
      req.user._id,
      req.params.productId
    );

    res.status(200).json({
      success: true,
      message: "Review eligibility checked successfully",
      data: eligibility
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(
      req.user._id,
      req.params.productId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Verified review submitted successfully",
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(
      req.user._id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    const result = await reviewService.deleteReview(
      req.user._id,
      req.params.id,
      isAdmin
    );

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getProductReviews(
      req.params.productId,
      req.query
    );

    res.status(200).json({
      success: true,
      message: "Product reviews fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewSummary = async (req, res, next) => {
  try {
    const summary = await reviewService.getReviewSummary(req.params.productId);

    res.status(200).json({
      success: true,
      message: "Review summary calculated successfully",
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

export const markReviewHelpful = async (req, res, next) => {
  try {
    const result = await reviewService.markReviewHelpful(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Review marked as helpful",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const moderateReview = async (req, res, next) => {
  try {
    const review = await reviewService.moderateReview(
      req.params.id,
      req.body.isApproved
    );

    res.status(200).json({
      success: true,
      message: `Review ${review.isApproved ? "approved" : "rejected"} successfully`,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const result = await reviewService.getAllReviewsAdmin(req.query);

    res.status(200).json({
      success: true,
      message: "Admin reviews retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  checkEligibility,
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getReviewSummary,
  markReviewHelpful,
  moderateReview,
  getAllReviewsAdmin
};
