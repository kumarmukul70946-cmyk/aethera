import { body, param, validationResult } from "express-validator";

/**
 * Middleware to evaluate validation rules and format error responses.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }

  next();
};

/**
 * Validation rules for POST /api/ai/chat.
 */
export const chatMessageValidator = [
  body("message")
    .exists({ checkFalsy: true })
    .withMessage("Message is required")
    .bail()
    .isString()
    .withMessage("Message must be a text string")
    .trim()
    .notEmpty()
    .withMessage("Message cannot be empty")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message cannot exceed 1000 characters"),

  body("sessionId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid session ID format")
];

/**
 * Validation rules for routes with :id parameter (e.g. GET /api/ai/sessions/:id).
 */
export const sessionIdParamValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid session ID format")
];

export default {
  validateRequest,
  chatMessageValidator,
  sessionIdParamValidator
};
