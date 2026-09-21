import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { getAnalytics } from "../controllers/aiInsightController.js";

const router = Router();

// Strict RBAC: Analytics endpoints require authenticated admin
router.use(protect);
router.use(requireRole("admin"));

// GET /api/admin/analytics?period=30d
router.get("/", getAnalytics);

export default router;
