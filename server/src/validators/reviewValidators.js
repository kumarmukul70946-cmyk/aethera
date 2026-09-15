import { body, param, query } from "express-validator";

/**
 * Review Validators
 * Enforces strong input validation for product ratings, comments, IDs, and filters.
 */

export const productIdParamValidator = [
  param("productId")
    .isMongoId()
    .withMessage("Invalid product ID format")
];

export const reviewIdParamValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID format")
];

export const createReviewValidator = [
  param("productId")
    .isMongoId()
    .withMessage("Invalid product ID format"),
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5")
    .toInt(),
  body("comment")
    .notEmpty()
    .withMessage("Review comment is required")
    .isString()
    .withMessage("Comment must be a string")
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Review comment must be between 5 and 1000 characters")
];

export const updateReviewValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID format"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5")
    .toInt(),
  body("comment")
    .optional()
    .isString()
    .withMessage("Comment must be a string")
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Review comment must be between 5 and 1000 characters")
];

export const reviewQueryValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),
  query("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating filter must be between 1 and 5")
    .toInt(),
  query("sort")
    .optional()
    .isIn(["newest", "oldest", "highest", "lowest", "helpful"])
    .withMessage("Sort must be one of: newest, oldest, highest, lowest, helpful")
];

export const moderateReviewValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID format"),
  body("isApproved")
    .notEmpty()
    .withMessage("isApproved is required")
    .isBoolean()
    .withMessage("isApproved must be a boolean value")
    .toBoolean()
];
