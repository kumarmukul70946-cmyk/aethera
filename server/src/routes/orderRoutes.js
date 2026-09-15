import { Router } from "express";
import orderController from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/authValidators.js";
import {
  createOrderValidator,
  orderIdValidator,
  orderPaginationValidator
} from "../validators/orderValidators.js";

const router = Router();

// All customer order endpoints require authentication
router.use(protect);

router.post("/", createOrderValidator, validateRequest, orderController.createOrder);
router.get("/", orderPaginationValidator, validateRequest, orderController.getOrders);
router.get("/:id", orderIdValidator, validateRequest, orderController.getOrderById);
router.patch("/:id/cancel", orderIdValidator, validateRequest, orderController.cancelOrder);

export default router;
