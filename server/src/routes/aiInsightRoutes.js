import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { aiInsightRateLimiter } from "../middleware/rateLimiter.js";
import { getInsights, generateInsights } from "../controllers/aiInsightController.js";

const router = Router();

// Strict RBAC: All insight endpoints require valid JWT authentication and 'admin' role
router.use(protect);
router.use(requireRole("admin"));
router.use(aiInsightRateLimiter);

// GET /api/admin/ai/insights?period=30d
router.get("/", getInsights);

// POST /api/admin/ai/insights/generate
router.post("/generate", generateInsights);

export default router;
