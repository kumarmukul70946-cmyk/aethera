import { body, param } from "express-validator";
import mongoose from "mongoose";

export const addToCartValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid Product ObjectId"),

  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer greater than 0"),

  body("customization")
    .optional()
    .isObject()
    .withMessage("Customization must be an object containing valid options")
];

export const updateCartItemValidator = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer of at least 1")
];
