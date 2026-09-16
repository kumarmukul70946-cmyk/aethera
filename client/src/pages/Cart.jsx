import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  selectCartItems,
  selectCartSubtotal,
  selectCartItemCount,
  selectCartLoading,
  selectCartActionLoading,
  selectCartError
} from "../features/cart/cartSlice.js";
import CartItem from "../components/cart/CartItem.jsx";
import CartSummary from "../components/cart/CartSummary.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import { CartIcon } from "../components/common/Icons.jsx";

export default function Cart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const itemCount = useSelector(selectCartItemCount);
  const loading = useSelector(selectCartLoading);
  const actionLoading = useSelector(selectCartActionLoading);
  const error = useSelector(selectCartError);

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = (productId, quantity) => {
    dispatch(updateCartItem({ productId, quantity }));
  };

  const handleRemove = (productId) => {
    dispatch(removeCartItem(productId));
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());
      setAppliedCoupon(null);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-neutral-500">Loading your shopping cart...</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          title="Could not load cart"
          message={error}
          onRetry={() => dispatch(fetchCart())}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center p-12 sm:p-16 bg-white border border-neutral-200/80 rounded-3xl shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto">
            <CartIcon className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-serif font-normal text-neutral-900">Your cart is empty</h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            Looks like you haven't added any curated pieces to your bag yet. Explore our latest arrivals and design icons.
          </p>
          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm"
            >
              Explore Products Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Title & Clear Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-neutral-200/80 mb-8 gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Shopping Bag</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900 tracking-tight mt-1">
            Review Your Cart
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"} selected &mdash; complimentary insured shipping available
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={actionLoading}
          className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-rose-600 transition"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="divide-y divide-neutral-100">
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
                disabled={actionLoading}
              />
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary
            subtotal={subtotal}
            itemCount={itemCount}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={setAppliedCoupon}
            onRemoveCoupon={() => setAppliedCoupon(null)}
          />
        </div>
      </div>
    </div>
  );
}
