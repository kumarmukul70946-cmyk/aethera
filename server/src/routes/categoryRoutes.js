import { Router } from "express";
import categoryController from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/authValidators.js";
import {
  createCategoryValidator,
  updateCategoryValidator
} from "../validators/categoryValidators.js";

const router = Router();

// Public routes
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);

// Protected Admin routes
router.post(
  "/",
  protect,
  authorize("admin"),
  createCategoryValidator,
  validateRequest,
  categoryController.createCategory
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateCategoryValidator,
  validateRequest,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  categoryController.deleteCategory
);

export default router;
