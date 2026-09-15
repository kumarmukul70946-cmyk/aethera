import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters.js";
import { ShieldCheckIcon, TruckIcon, CloseIcon, SparklesIcon } from "../common/Icons.jsx";
import couponService from "../../services/couponService.js";

/**
 * Cart Summary & Coupon Application Component.
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
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-xl sticky top-24">
      <h3 className="text-lg font-bold text-white pb-3 border-b border-slate-800">
        Order Summary
      </h3>

      {/* Line items */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span className="font-semibold text-slate-200">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {appliedCoupon && (
          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5" />
              Coupon ({appliedCoupon.coupon.code})
            </span>
            <span className="font-semibold">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-400">
          <span>Estimated Shipping</span>
          <span className="font-semibold text-emerald-400">Free</span>
        </div>
      </div>

      {/* Coupon Application Box */}
      <div className="pt-3 border-t border-slate-800">
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span>Coupon applied: {appliedCoupon.coupon.code}</span>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="p-1 hover:text-white rounded-lg transition"
              aria-label="Remove coupon"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Coupon code (e.g. WELCOME10)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={loading || !couponInput.trim()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 disabled:opacity-40 text-xs font-semibold text-white transition"
              >
                {loading ? "..." : "Apply"}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 leading-tight">{error}</p>
            )}
          </form>
        )}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-slate-800 flex items-baseline justify-between">
        <div>
          <span className="text-base font-bold text-white">Total Amount</span>
          <p className="text-xs text-slate-500">Includes all applicable taxes</p>
        </div>
        <span className="text-2xl font-extrabold text-white tracking-tight">
          {formatCurrency(finalTotal)}
        </span>
      </div>

      {/* Checkout Button */}
      <Link
        to="/checkout"
        className={`w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 ${
          checkoutDisabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <span>Proceed to Checkout</span>
        <span>→</span>
      </Link>

      {/* Trust badges */}
      <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
          <span>Encrypted Checkout</span>
        </div>
        <div className="flex items-center gap-1">
          <TruckIcon className="w-4 h-4 text-cyan-400" />
          <span>Express Delivery</span>
        </div>
      </div>
    </div>
  );
}
