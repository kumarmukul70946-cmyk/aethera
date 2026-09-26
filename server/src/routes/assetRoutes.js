import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";
import {
  validateAssetUpload,
  validateAssetReplacement
} from "../validators/assetValidators.js";
import {
  uploadAsset,
  getAssets,
  getAssetById,
  replaceAsset,
  deleteAsset,
  associateProductAssets
} from "../controllers/assetController.js";

const router = Router();

// Strict RBAC: All media & 3D asset routes require authenticated admin
router.use(protect);
router.use(requireRole("admin"));

// POST /api/admin/assets — Upload new image or 3D asset
router.post("/", uploadSingle("file"), validateAssetUpload, uploadAsset);

// GET /api/admin/assets — List and filter assets with pagination
router.get("/", getAssets);

// GET /api/admin/assets/:id — Get single asset details
router.get("/:id", getAssetById);

// PATCH /api/admin/assets/:id — Safe asset replacement
router.patch("/:id", uploadSingle("file"), validateAssetReplacement, replaceAsset);

// DELETE /api/admin/assets/:id — Delete asset from storage & MongoDB
router.delete("/:id", deleteAsset);

// PATCH /api/admin/assets/products/:productId/associate — Associate asset with product
router.patch("/products/:productId/associate", associateProductAssets);

export default router;
