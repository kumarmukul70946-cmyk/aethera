import { Router } from "express";
import addressController from "../controllers/addressController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/authValidators.js";
import {
  createAddressValidator,
  updateAddressValidator,
  addressIdValidator
} from "../validators/addressValidators.js";

const router = Router();

// All address routes require authentication
router.use(protect);

router.get("/", addressController.getAddresses);
router.post("/", createAddressValidator, validateRequest, addressController.createAddress);
router.put("/:id", updateAddressValidator, validateRequest, addressController.updateAddress);
router.delete("/:id", addressIdValidator, validateRequest, addressController.deleteAddress);
router.patch("/:id/default", addressIdValidator, validateRequest, addressController.setDefaultAddress);

export default router;
