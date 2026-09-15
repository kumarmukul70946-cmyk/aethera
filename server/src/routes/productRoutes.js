import { Router } from "express";
import productController from "../controllers/productController.js";
import { productReviewRouter } from "./reviewRoutes.js";
import reviewSummaryRoutes from "./reviewSummaryRoutes.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/authValidators.js";
import {
  createProductValidator,
  updateProductValidator,
  updateStockValidator,
  productQueryValidator,
  similarProductsValidator
} from "../validators/productValidators.js";

const router = Router();

// Mount review and review-summary sub-routes
router.use("/:productId/reviews", productReviewRouter);
router.use("/:productId/review-summary", reviewSummaryRoutes);


// ── Public Customer Endpoints ────────────────────────────────────────────────
// Note: Specific sub-routes are declared BEFORE generic parameterized /:id route

router.get("/", productQueryValidator, validateRequest, productController.getProducts);
router.get("/search", productController.searchProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/trending", productController.getTrendingProducts);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id/similar", similarProductsValidator, validateRequest, productController.getSimilarProducts);
router.get("/:id", productController.getProductById);

// ── Protected Admin Endpoints ────────────────────────────────────────────────
router.post(
  "/",
  protect,
  authorize("admin"),
  createProductValidator,
  validateRequest,
  productController.createProduct
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateProductValidator,
  validateRequest,
  productController.updateProduct
);

router.patch(
  "/:id/stock",
  protect,
  authorize("admin"),
  updateStockValidator,
  validateRequest,
  productController.updateStock
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  productController.deleteProduct
);

export default router;
