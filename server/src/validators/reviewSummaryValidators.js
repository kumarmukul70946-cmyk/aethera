import { param } from "express-validator";

/**
 * Review Summary Validators
 * Validates request parameters for AI review summary endpoints.
 */

export const productIdParamValidator = [
  param("productId")
    .isMongoId()
    .withMessage("Invalid product ID format")
];

export default {
  productIdParamValidator
};
