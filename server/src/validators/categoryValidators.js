import { body } from "express-validator";

/**
 * Validation rules for creating a category.
 */
export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Category name must be between 2 and 80 characters"),

  body("slug")
    .optional()
    .trim()
    .isSlug()
    .withMessage("Slug must be a valid lowercase URL slug (e.g. smart-electronics)"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("image")
    .optional()
    .isString()
    .withMessage("Image must be a valid URL or path string")
];

/**
 * Validation rules for updating a category.
 */
export const updateCategoryValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category name cannot be empty")
    .isLength({ min: 2, max: 80 })
    .withMessage("Category name must be between 2 and 80 characters"),

  body("slug")
    .optional()
    .trim()
    .isSlug()
    .withMessage("Slug must be a valid lowercase URL slug"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("image")
    .optional()
    .isString()
    .withMessage("Image must be a valid URL or path string")
];
