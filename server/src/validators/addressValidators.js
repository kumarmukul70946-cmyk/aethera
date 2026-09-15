import { body, param } from "express-validator";
import mongoose from "mongoose";

export const addressIdValidator = [
  param("id")
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid Address ID format")
];

export const createAddressValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 100 })
    .withMessage("Full name cannot exceed 100 characters"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 7, max: 20 })
    .withMessage("Phone number must be between 7 and 20 characters"),

  body("addressLine")
    .trim()
    .notEmpty()
    .withMessage("Street address line is required"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),

  body("postalCode")
    .trim()
    .notEmpty()
    .withMessage("Postal code is required"),

  body("country")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Country cannot be empty if specified"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean value")
];

export const updateAddressValidator = [
  ...addressIdValidator,
  ...createAddressValidator.map((v) => v.optional())
];
