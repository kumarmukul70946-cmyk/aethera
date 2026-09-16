import { body, query, param } from "express-validator";
import mongoose from "mongoose";

/**
 * Validation rules for creating a product (Admin only).
 */
export const createProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Product name must be between 2 and 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required"),

  body("category")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Category must be a valid MongoDB ObjectId"),

  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Brand is required"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a number greater than or equal to 0"),

  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0% and 100%"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be an integer greater than or equal to 0"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),

  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings"),

  body("colors")
    .optional()
    .isArray()
    .withMessage("Colors must be an array of strings"),

  body("sizes")
    .optional()
    .isArray()
    .withMessage("Sizes must be an array of strings"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings"),

  body().custom((value) => {
    if (value && (value.rating !== undefined || value.reviewCount !== undefined || value.salesCount !== undefined)) {
      throw new Error("Rating, review count, and sales count cannot be manually set via product creation");
    }
    return true;
  })
];

/**
 * Validation rules for updating a product (Admin only).
 */
export const updateProductValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty")
    .isLength({ min: 2, max: 200 })
    .withMessage("Product name must be between 2 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product description cannot be empty"),

  body("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid MongoDB ObjectId"),

  body("brand")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Brand cannot be empty"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a number greater than or equal to 0"),

  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0% and 100%"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be an integer greater than or equal to 0"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body().custom((value) => {
    if (value && (value.rating !== undefined || value.reviewCount !== undefined || value.salesCount !== undefined)) {
      throw new Error("Rating, review count, and sales count cannot be manually modified via product updates");
    }
    return true;
  })
];

/**
 * Validation rules for stock update endpoint.
 */
export const updateStockValidator = [
  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be an integer greater than or equal to 0")
];

/**
 * Validation rules for product listing query parameters.
 */
export const productQueryValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer starting from 1"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be an integer between 1 and 50"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("minPrice must be greater than or equal to 0"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("maxPrice must be greater than or equal to 0"),

  query("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),

  query("minDiscount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("minDiscount must be between 0 and 100"),

  query("sort")
    .optional()
    .isIn(["price_asc", "price_desc", "rating", "newest", "popular", "discount_desc"])
    .withMessage("Sort must be one of: price_asc, price_desc, rating, newest, popular, discount_desc")
];

/**
 * Validation rules for similar products endpoint (Part 14).
 */
export const similarProductsValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid product ID format"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Limit must be an integer between 1 and 20")
];
