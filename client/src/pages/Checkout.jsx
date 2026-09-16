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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Title */}
      <div className="pb-6 border-b border-neutral-200/80 mb-8">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Checkout</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900 tracking-tight mt-1">
          Finalize Your Order
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Complete delivery details and select payment method to dispatch your parcel
        </p>
      </div>

      {checkoutError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {checkoutError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Main Steps Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Address Selection */}
          <section className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
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
          <section className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">Step 2</span>
                <h3 className="text-base font-serif font-normal text-neutral-900">
                  Review Items ({cartItemCount})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item._id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200/60 overflow-hidden shrink-0 flex items-center justify-center">
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
                      <p className="font-medium text-neutral-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-neutral-500 mt-0.5">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-neutral-900 shrink-0">
                    {formatCurrency(item.itemSubtotal)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Step 3: Payment Method */}
          <section className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">Step 3</span>
              <h3 className="text-base font-serif font-normal text-neutral-900">
                Payment Method
              </h3>
            </div>
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-900/20 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-5 h-5 rounded-full border-2 border-neutral-900 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-neutral-500">Pay cash or scan QR via UPI upon delivery at doorstep</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                Available
              </span>
            </div>
          </section>
        </div>

        {/* Sidebar Summary & Order Action */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm sticky top-24">
            <h3 className="text-xl font-serif font-normal text-neutral-900 pb-3 border-b border-neutral-100">
              Order Breakdown
            </h3>

            {/* Price Line Items */}
            <div className="space-y-3.5 text-xs text-neutral-600">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(cartSubtotal)}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-neutral-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <SparklesIcon className="w-3.5 h-3.5 text-neutral-900" />
                    Coupon ({appliedCoupon.coupon.code})
                  </span>
                  <span className="font-semibold text-emerald-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-neutral-900">Complimentary</span>
              </div>
            </div>

            {/* Coupon Application */}
            <div className="pt-4 border-t border-neutral-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-semibold">
                  <span>Applied: {appliedCoupon.coupon.code}</span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="p-1 text-neutral-400 hover:text-neutral-900"
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
                      className="flex-1 bg-[#FAF9F6] border border-neutral-200 rounded-full px-4 py-2.5 text-xs text-neutral-900 uppercase placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCodeInput.trim()}
                      className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-xs font-semibold uppercase tracking-wider text-white transition shadow-sm"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>
                  )}
                </form>
              )}
            </div>

            {/* Final Total */}
            <div className="pt-4 border-t border-neutral-100 flex items-baseline justify-between">
              <div>
                <span className="text-sm font-semibold text-neutral-900">Final Payable</span>
                <p className="text-[11px] text-neutral-400">Includes all duties & taxes</p>
              </div>
              <span className="text-2xl font-serif font-normal text-neutral-900 tracking-tight">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            {/* Place Order Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={checkoutLoading || !selectedAddressId}
              className="w-full py-4 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white font-semibold text-xs uppercase tracking-widest transition shadow-sm flex items-center justify-center gap-2"
            >
              {checkoutLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Confirm & Dispatch</span>
              )}
            </button>

            {/* Guarantees */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-neutral-800" />
                <span>Curated Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TruckIcon className="w-4 h-4 text-neutral-800" />
                <span>Insured Express</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
