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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading your shopping cart...</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center p-12 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <CartIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Looks like you haven't added any gear to your cart yet. Explore our latest arrivals!
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-lg shadow-indigo-600/25"
            >
              Explore Products Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review your selected products and proceed to checkout
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={actionLoading}
          className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
          <div className="divide-y divide-slate-800/60">
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
