import { query } from "express-validator";

/**
 * Validation rules for GET /api/search/semantic endpoint.
 * Protects against parameter tampering, injection, and invalid range queries.
 */
export const semanticSearchValidator = [
  query("q")
    .exists({ checkFalsy: true })
    .withMessage("Search query parameter 'q' is required")
    .bail()
    .isString()
    .withMessage("Search query must be a string")
    .trim()
    .notEmpty()
    .withMessage("Search query cannot be empty")
    .isLength({ min: 1, max: 300 })
    .withMessage("Search query cannot exceed 300 characters"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be an integer greater than or equal to 1"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be an integer between 1 and 50"),

  query("category")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category filter cannot exceed 100 characters"),

  query("brand")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Brand filter cannot exceed 100 characters"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("minPrice must be a number greater than or equal to 0"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("maxPrice must be a number greater than or equal to 0"),

  query("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be a number between 0 and 5"),

  query().custom((values) => {
    if (values.minPrice !== undefined && values.maxPrice !== undefined) {
      const min = parseFloat(values.minPrice);
      const max = parseFloat(values.maxPrice);
      if (!isNaN(min) && !isNaN(max) && min > max) {
        throw new Error("minPrice cannot be greater than maxPrice");
      }
    }
    return true;
  })
];

export default {
  semanticSearchValidator
};
