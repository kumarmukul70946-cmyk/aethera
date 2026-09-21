import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

/**
 * Validator for AI 3D product customization requests.
 * Enforces strict input bounding to protect LLM context windows and API endpoints.
 */
export const customizationIntentValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid Product ObjectId"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Customization message cannot be empty")
    .isLength({ min: 1, max: 500 })
    .withMessage("Customization message must be between 1 and 500 characters"),

  body("currentCustomization")
    .optional()
    .isObject()
    .withMessage("Current customization state must be a valid object")
];

/**
 * Middleware to evaluate validation errors and return structured 400 response.
 */
export const validateCustomizationRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed for AI customization request",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};
