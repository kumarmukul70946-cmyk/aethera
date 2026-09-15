import { Router } from "express";
import cartController from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/authValidators.js";
import {
  addToCartValidator,
  updateCartItemValidator
} from "../validators/cartValidators.js";

const router = Router();

// All cart operations strictly require user authentication
router.use(protect);

router.get("/", cartController.getCart);
router.post("/items", addToCartValidator, validateRequest, cartController.addItem);
router.put("/items/:productId", updateCartItemValidator, validateRequest, cartController.updateItem);
router.delete("/items/:productId", cartController.removeItem);
router.delete("/", cartController.clearCart);

export default router;
