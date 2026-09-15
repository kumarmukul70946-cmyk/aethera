import { body } from "express-validator";

export const validateCouponValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Coupon code must be between 2 and 20 characters")
];
