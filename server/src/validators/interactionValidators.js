import { body } from "express-validator";
import mongoose from "mongoose";

/**
 * Public interaction types that clients are authorized to report directly.
 * Critical business interactions (PURCHASE, RATING, CART, WISHLIST) must originate
 * strictly server-side from verified database transactions.
 */
const ALLOWED_CLIENT_TYPES = ["VIEW", "SEARCH"];
const RESTRICTED_SERVER_TYPES = ["PURCHASE", "RATING", "CART", "WISHLIST"];

/**
 * Validator for POST /api/interactions
 */
export const createInteractionValidator = [
  // 1. Validate interaction type
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Interaction type is required")
    .custom((value) => {
      if (RESTRICTED_SERVER_TYPES.includes(value)) {
        throw new Error(
          `Interaction type '${value}' cannot be submitted directly by clients. It must be generated server-side by verified business actions.`
        );
      }
      if (!ALLOWED_CLIENT_TYPES.includes(value)) {
        throw new Error(`Unsupported interaction type '${value}'. Allowed client types: ${ALLOWED_CLIENT_TYPES.join(", ")}`);
      }
      return true;
    }),

  // 2. Validate productId: Required for VIEW, optional for SEARCH
  body("productId")
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      if (!value) {
        if (req.body.type === "VIEW") {
          throw new Error("productId is required for VIEW interactions");
        }
        return true;
      }
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid productId format. Must be a valid MongoDB ObjectId");
      }
      return true;
    }),

  // 3. Validate sessionId for anonymous visitors
  body("sessionId")
    .optional()
    .isString()
    .withMessage("sessionId must be a string")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("sessionId must be between 1 and 100 characters"),

  // 4. Validate metadata: Must be an object, size under 2KB, search query validation
  body("metadata")
    .optional()
    .custom((value, { req }) => {
      if (value !== undefined && (typeof value !== "object" || value === null || Array.isArray(value))) {
        throw new Error("metadata must be a key-value object");
      }

      // Check size
      if (value && JSON.stringify(value).length > 2048) {
        throw new Error("metadata exceeds maximum allowed size of 2KB");
      }

      // If SEARCH type, query is mandatory and non-empty
      if (req.body.type === "SEARCH") {
        const query = value?.query;
        if (!query || typeof query !== "string" || !query.trim()) {
          throw new Error("metadata.query is required and cannot be empty for SEARCH interactions");
        }
        if (query.trim().length > 150) {
          throw new Error("metadata.query cannot exceed 150 characters");
        }
      }

      return true;
    }),

  // 5. Security guards: Reject client-supplied identity, roles, or artificial timestamps
  body().custom((value) => {
    if (value && (value.userId !== undefined || value.user !== undefined)) {
      throw new Error("Client-provided userId is strictly prohibited. User identity is established via session credentials only.");
    }
    if (value && value.role !== undefined) {
      throw new Error("Role specification in interaction payload is forbidden");
    }
    if (value && value.createdAt !== undefined) {
      throw new Error("Custom timestamps are forbidden. Timestamps are generated server-side.");
    }
    if (value && value.verifiedPurchase !== undefined) {
      throw new Error("Arbitrary purchase verification is forbidden");
    }
    return true;
  })
];

export default { createInteractionValidator };
