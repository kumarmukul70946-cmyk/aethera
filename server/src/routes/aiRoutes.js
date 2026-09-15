import { Router } from "express";
import aiController from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiRateLimiter } from "../middleware/rateLimiter.js";
import {
  chatMessageValidator,
  sessionIdParamValidator,
  validateRequest
} from "../validators/aiValidators.js";

const router = Router();

// All AI assistant routes require authentication to tie sessions to verified users
router.use(protect);

/**
 * @route   POST /api/ai/chat
 * @desc    Send a message to the grounded AI shopping assistant
 * @access  Private
 */
router.post(
  "/chat",
  aiRateLimiter,
  chatMessageValidator,
  validateRequest,
  aiController.chat
);

/**
 * @route   GET /api/ai/sessions
 * @desc    Retrieve all chat sessions for the authenticated user
 * @access  Private
 */
router.get("/sessions", aiController.getSessions);

/**
 * @route   GET /api/ai/sessions/:id
 * @desc    Retrieve a specific chat session with its full message history
 * @access  Private
 */
router.get(
  "/sessions/:id",
  sessionIdParamValidator,
  validateRequest,
  aiController.getSessionById
);

/**
 * @route   DELETE /api/ai/sessions/:id
 * @desc    Delete a chat session
 * @access  Private
 */
router.delete(
  "/sessions/:id",
  sessionIdParamValidator,
  validateRequest,
  aiController.deleteSession
);

export default router;
