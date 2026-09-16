import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters.js";
import { ShieldCheckIcon, TruckIcon, CloseIcon, SparklesIcon } from "../common/Icons.jsx";
import couponService from "../../services/couponService.js";

/**
 * Cart Summary & Coupon Application Component — Warm-light Japandi style.
 */
export default function CartSummary({
  subtotal = 0,
  itemCount = 0,
  appliedCoupon = null,
  onApplyCoupon,
  onRemoveCoupon,
  checkoutDisabled = false
}) {
  const [couponInput, setCouponInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await couponService.validateCoupon(
        couponInput.trim(),
        subtotal
      );
      if (onApplyCoupon) {
        onApplyCoupon(result);
      }
      setCouponInput("");
    } catch (err) {
      setError(err.message || "Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm sticky top-24 text-neutral-900">
      <h3 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
        Order Summary
      </h3>

      {/* Line items */}
      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-neutral-500 font-light">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span className="font-semibold text-neutral-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {appliedCoupon && (
          <div className="flex items-center justify-between text-emerald-700">
            <span className="flex items-center gap-1.5 font-medium">
              <SparklesIcon className="w-3.5 h-3.5" />
              Coupon ({appliedCoupon.coupon.code})
            </span>
            <span className="font-bold">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-neutral-500 font-light">
          <span>Estimated Delivery</span>
          <span className="font-bold text-emerald-700">FREE</span>
        </div>
      </div>

      {/* Coupon Application Box */}
      <div className="pt-3 border-t border-neutral-100">
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold">
            <span>Coupon applied: {appliedCoupon.coupon.code}</span>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="p-1 hover:text-emerald-950 rounded-full transition"
              aria-label="Remove coupon"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="PROMO CODE"
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2 text-xs text-neutral-900 uppercase placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={loading || !couponInput.trim()}
                className="px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-xs font-semibold text-white transition shadow-xs"
              >
                {loading ? "..." : "Apply"}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-rose-600 leading-tight pl-2">{error}</p>
            )}
          </form>
        )}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-neutral-100 flex items-baseline justify-between">
        <div>
          <span className="text-sm font-bold text-neutral-900">Total Amount</span>
          <p className="text-[11px] text-neutral-400 font-light">Includes all applicable taxes</p>
        </div>
        <span className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          {formatCurrency(finalTotal)}
        </span>
      </div>

      {/* Checkout Button */}
      <Link
        to="/checkout"
        className={`w-full py-3 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 ${
          checkoutDisabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <span>Proceed to Checkout</span>
        <span className="text-sm">→</span>
      </Link>

      {/* Trust badges */}
      <div className="pt-1 flex items-center justify-center gap-4 text-[11px] text-neutral-400">
        <div className="flex items-center gap-1">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-neutral-600" />
          <span>Encrypted Checkout</span>
        </div>
        <div className="flex items-center gap-1">
          <TruckIcon className="w-3.5 h-3.5 text-neutral-600" />
          <span>Pan-India Delivery</span>
        </div>
      </div>
    </div>
  );
}
