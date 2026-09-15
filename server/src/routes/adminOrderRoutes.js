import { Router } from "express";
import adminOrderController from "../controllers/adminOrderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/authValidators.js";
import {
  orderIdValidator,
  updateOrderStatusValidator,
  orderPaginationValidator
} from "../validators/orderValidators.js";

const router = Router();

// All admin order endpoints require authentication AND admin role
router.use(protect, authorize("admin"));

router.get("/", orderPaginationValidator, validateRequest, adminOrderController.getAllOrders);
router.get("/:id", orderIdValidator, validateRequest, adminOrderController.getOrderById);
router.patch("/:id/status", updateOrderStatusValidator, validateRequest, adminOrderController.updateOrderStatus);

export default router;
