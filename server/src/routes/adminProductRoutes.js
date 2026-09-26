import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import adminProductController from "../controllers/adminProductController.js";
import { associateProductAssets } from "../controllers/assetController.js";

const router = Router();


// All routes in this router require authentication and admin role
router.use(protect, authorize("admin"));

// Bulk generation endpoint
router.post("/generate-embeddings", adminProductController.generateBatchEmbeddings);

// Single product generation endpoint
router.post("/:id/generate-embedding", adminProductController.generateSingleEmbedding);

// Associate or update product assets (images, 3D models)
router.patch("/:productId/assets", associateProductAssets);

export default router;

