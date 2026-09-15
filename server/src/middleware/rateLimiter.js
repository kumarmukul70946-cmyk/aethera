import rateLimit from "express-rate-limit";

/**
 * General rate limiter for standard API endpoints.
 * 200 requests per 15 minutes.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 200 : 10000,
  skip: () => process.env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
  }
});

/**
 * Stricter rate limiter for sensitive authentication endpoints (register/login).
 * Protects against credential stuffing and brute-force attacks.
 * 50 attempts per 15 minutes per IP in production.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 50 : 2000,
  skip: () => process.env.NODE_ENV === "test",
  standardHeaders: true,
  message: {
    success: false,
    message: "Too many authentication attempts from this IP, please try again after 15 minutes."
  }
});

/**
 * Rate limiter for client analytics and interaction tracking.
 * Prevents telemetry flooding and event spam.
 * 300 events per 15 minutes per IP.
 */
export const interactionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 300 : 10000,
  skip: () => process.env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many interaction tracking events from this IP, please slow down."
  }
});

/**
 * Strict rate limiter for AI chat endpoints to prevent API quota exhaustion.
 * 30 chat messages per 15 minutes per IP in production.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 30 : 1000,
  skip: () => process.env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI assistant requests from this IP, please try again in a few minutes."
  }
});

/**
 * Rate limiter for AI review summary generation.
 * Prevents denial of service and controls LLM generation costs.
 * 60 requests per 15 minutes per IP in production.
 */
export const aiReviewSummaryRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 60 : 2000,
  skip: () => process.env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI review summary requests from this IP, please try again in a few minutes."
  }
});

export default {
  apiRateLimiter,
  authRateLimiter,
  interactionRateLimiter,
  aiRateLimiter,
  aiReviewSummaryRateLimiter
};


