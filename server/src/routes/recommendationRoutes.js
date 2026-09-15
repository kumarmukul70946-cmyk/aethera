import { Router } from "express";
import { query } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/authValidators.js";
import { getRecommendations } from "../controllers/recommendationController.js";

const router = Router();

const recommendationQueryValidator = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be an integer between 1 and 50"),
  query("contextProductId")
    .optional()
    .isMongoId()
    .withMessage("Context product ID must be a valid MongoDB ObjectId")
];

// All recommendation requests strictly require authenticated identity
router.get(
  "/",
  protect,
  recommendationQueryValidator,
  validateRequest,
  getRecommendations
);

export default router;
