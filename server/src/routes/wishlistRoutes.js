import { Router } from "express";
import wishlistController from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All wishlist endpoints require user authentication
router.use(protect);

router.get("/", wishlistController.getWishlist);
router.post("/:productId", wishlistController.addToWishlist);
router.delete("/:productId", wishlistController.removeFromWishlist);
router.post("/:productId/move-to-cart", wishlistController.moveToCart);

export default router;
