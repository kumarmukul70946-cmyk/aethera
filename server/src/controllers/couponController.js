import couponService from "../services/couponService.js";
import cartService from "../services/cartService.js";

/**
 * Coupon Controller
 */
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    // Fetch user's cart
    const cart = await cartService.getCart(req.user._id);

    // Derive cart subtotal from user's current cart, or allow provided subtotal
    let effectiveSubtotal = cart.cartSubtotal;
    if (subtotal !== undefined && !isNaN(Number(subtotal))) {
      effectiveSubtotal = Number(subtotal);
    }

    const result = await couponService.validateCoupon(code, effectiveSubtotal);

    res.status(200).json({
      success: true,
      message: "Coupon validated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  validateCoupon
};
