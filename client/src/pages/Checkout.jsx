import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  selectCartItems,
  selectCartSubtotal,
  selectCartItemCount
} from "../features/cart/cartSlice.js";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
  selectAddresses,
  selectSelectedAddressId,
  selectAddressLoading
} from "../features/address/addressSlice.js";
import {
  createOrder,
  selectCheckoutLoading,
  selectCheckoutError
} from "../features/orders/orderSlice.js";
import AddressSelector from "../components/checkout/AddressSelector.jsx";
import { formatCurrency } from "../utils/formatters.js";
import couponService from "../services/couponService.js";
import { ShieldCheckIcon, TruckIcon, CloseIcon, SparklesIcon, CheckIcon } from "../components/common/Icons.jsx";

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const cartSubtotal = useSelector(selectCartSubtotal);
  const cartItemCount = useSelector(selectCartItemCount);

  const addresses = useSelector(selectAddresses);
  const selectedAddressId = useSelector(selectSelectedAddressId);
  const addressLoading = useSelector(selectAddressLoading);

  const checkoutLoading = useSelector(selectCheckoutLoading);
  const checkoutError = useSelector(selectCheckoutError);

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddresses());
  }, [dispatch]);

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (cartItems.length === 0 && !checkoutLoading) {
      navigate("/cart", { replace: true });
    }
  }, [cartItems.length, checkoutLoading, navigate]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await couponService.validateCoupon(
        couponCodeInput.trim(),
        cartSubtotal
      );
      setAppliedCoupon(result);
      setCouponCodeInput("");
    } catch (err) {
      setCouponError(err.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select or add a shipping address first.");
      return;
    }

    const payload = {
      shippingAddressId: selectedAddressId,
      couponCode: appliedCoupon?.coupon?.code || undefined,
      paymentMethod: "COD"
    };

    const resultAction = await dispatch(createOrder(payload));
    if (!resultAction.error) {
      const order = resultAction.payload;
      navigate("/order-success", { state: { order }, replace: true });
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title */}
      <div className="pb-6 border-b border-slate-800 mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete your delivery details and place your order
        </p>
      </div>

      {checkoutError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {checkoutError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Main Steps Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Address Selection */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
            <AddressSelector
              addresses={addresses}
              selectedId={selectedAddressId}
              onSelect={(id) => dispatch(selectAddress(id))}
              onCreateAddress={(data) => dispatch(createAddress(data))}
              onUpdateAddress={(id, data) => dispatch(updateAddress({ id, addressData: data }))}
              onDeleteAddress={(id) => dispatch(deleteAddress(id))}
              loading={addressLoading}
            />
          </section>

          {/* Step 2: Order Items Review */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Review Cart Items ({cartItemCount})
            </h3>
            <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.product?.images?.[0] ? (
                        <img
                          src={
                            typeof item.product.images[0] === "string"
                              ? item.product.images[0]
                              : item.product.images[0]?.url
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>✨</span>
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-slate-400">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-100 shrink-0">
                    {formatCurrency(item.itemSubtotal)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Step 3: Payment Method */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Payment Method
            </h3>
            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-slate-400">Pay cash or UPI upon delivery at your doorstep</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified
              </span>
            </div>
          </section>
        </div>

        {/* Sidebar Summary & Order Action */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-xl sticky top-24">
            <h3 className="text-lg font-bold text-white pb-3 border-b border-slate-800">
              Payment Breakdown
            </h3>

            {/* Price Line Items */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-200">
                  {formatCurrency(cartSubtotal)}
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
                <span>Shipping Fee</span>
                <span className="font-semibold text-emerald-400">Free</span>
              </div>
            </div>

            {/* Coupon Application */}
            <div className="pt-3 border-t border-slate-800">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <span>Applied: {appliedCoupon.coupon.code}</span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="p-1 hover:text-white"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCodeInput.trim()}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 disabled:opacity-40 text-xs font-semibold text-white transition"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-400">{couponError}</p>
                  )}
                </form>
              )}
            </div>

            {/* Final Total */}
            <div className="pt-4 border-t border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-base font-bold text-white">Final Payable</span>
                <p className="text-xs text-slate-500">Includes all taxes</p>
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            {/* Place Order Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={checkoutLoading || !selectedAddressId}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold text-sm transition shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              {checkoutLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Place Order with COD</span>
              )}
            </button>

            {/* Guarantees */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-1">
                <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
                <span>100% Genuine</span>
              </div>
              <div className="flex items-center gap-1">
                <TruckIcon className="w-4 h-4 text-cyan-400" />
                <span>Zero Shipping Fee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
