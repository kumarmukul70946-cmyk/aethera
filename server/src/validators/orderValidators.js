import { body, param, query } from "express-validator";
import mongoose from "mongoose";

export const orderIdValidator = [
  param("id")
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid Order ID format")
];

export const createOrderValidator = [
  body("shippingAddressId")
    .notEmpty()
    .withMessage("Shipping address ID is required")
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid shipping address ObjectId"),

  body("couponCode")
    .optional()
    .trim(),

  body("paymentMethod")
    .optional()
    .isIn(["COD", "CARD", "UPI", "NET_BANKING", "WALLET"])
    .withMessage("Invalid payment method")
];

export const updateOrderStatusValidator = [
  ...orderIdValidator,
  body("status")
    .notEmpty()
    .withMessage("Order status is required")
    .isIn([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED"
    ])
    .withMessage("Invalid order status")
];

export const orderPaginationValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
];
