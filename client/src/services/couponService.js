import api from "./api.js";

/**
 * Coupon Service
 */
export const couponService = {
  async validateCoupon(code, subtotal) {
    const res = await api.post("/coupons/validate", {
      code,
      subtotal
    });
    return res.data.data;
  }
};

export default couponService;
