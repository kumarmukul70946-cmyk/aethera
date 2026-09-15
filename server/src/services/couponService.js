import { Coupon } from "../models/index.js";

export const couponService = {
  /**
   * Validate coupon code against current cart subtotal.
   * Does NOT increment usage count (only validation).
   * @param {string} code - Coupon code (e.g. "WELCOME10")
   * @param {number} cartSubtotal - Current subtotal calculated on server
   * @returns {Promise<Object>} { coupon, discount, newTotal }
   */
  async validateCoupon(code, cartSubtotal) {
    if (!code || typeof code !== "string") {
      const err = new Error("Coupon code is required");
      err.statusCode = 400;
      throw err;
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
      const err = new Error("Invalid coupon code");
      err.statusCode = 404;
      throw err;
    }

    if (!coupon.isActive) {
      const err = new Error("This coupon is currently inactive");
      err.statusCode = 400;
      throw err;
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      const err = new Error("This coupon has expired");
      err.statusCode = 400;
      throw err;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      const err = new Error("This coupon's maximum usage limit has been reached");
      err.statusCode = 400;
      throw err;
    }

    if (cartSubtotal < coupon.minimumOrderAmount) {
      const err = new Error(
        `Minimum order subtotal of ₹${coupon.minimumOrderAmount.toLocaleString()} required to apply this coupon`
      );
      err.statusCode = 400;
      throw err;
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = Math.round(cartSubtotal * (coupon.value / 100));
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else if (coupon.type === "fixed") {
      discount = Math.min(coupon.value, cartSubtotal);
    }

    const newTotal = Math.max(0, cartSubtotal - discount);

    return {
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscount: coupon.maximumDiscount
      },
      discount,
      newTotal
    };
  }
};

export default couponService;
