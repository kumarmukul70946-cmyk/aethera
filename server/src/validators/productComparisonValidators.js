import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

/**
 * Middleware to evaluate validation rules and format error responses.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }

  next();
};

/**
 * Validation rules for POST /api/ai/compare
 *
 * Requirements:
 * 1. Require at least 2 products.
 * 2. Allow a maximum of 4 products.
 * 3. Reject duplicate product IDs.
 * 4. Require valid MongoDB ObjectIds.
 * 5. Optional question: max 500 characters string.
 */
export const compareProductsValidator = [
  body("productIds")
    .exists({ checkFalsy: false })
    .withMessage("productIds array is required")
    .bail()
    .isArray()
    .withMessage("productIds must be an array")
    .bail()
    .custom((value) => {
      if (value.length < 2) {
        throw new Error("At least 2 products are required for comparison.");
      }
      if (value.length > 4) {
        throw new Error("A maximum of 4 products can be compared at once.");
      }

      // Check each ID is a valid MongoDB ObjectId
      for (const id of value) {
        if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid product ID format: ${id}`);
        }
      }

      // Reject duplicate product IDs
      const uniqueIds = new Set(value.map((id) => id.toString()));
      if (uniqueIds.size !== value.length) {
        throw new Error("Duplicate product IDs are not allowed in comparison.");
      }

      return true;
    }),

  body("question")
    .optional({ nullable: true })
    .isString()
    .withMessage("Question must be a text string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Question cannot exceed 500 characters")
];

export default {
  validateRequest,
  compareProductsValidator
};
