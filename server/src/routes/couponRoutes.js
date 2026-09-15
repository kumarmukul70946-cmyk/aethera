import { Router } from "express";
import couponController from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/authValidators.js";
import { validateCouponValidator } from "../validators/couponValidators.js";

const router = Router();

// Protect coupon validation endpoint
router.use(protect);

router.post("/validate", validateCouponValidator, validateRequest, couponController.validateCoupon);

export default router;
