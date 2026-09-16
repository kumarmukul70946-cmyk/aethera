import React from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { CheckIcon, CubeIcon, TruckIcon } from "../components/common/Icons.jsx";
import { formatCurrency } from "../utils/formatters.js";

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-8 sm:p-14 shadow-sm text-center space-y-8">
        {/* Animated Success Badge */}
        <div className="w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-md">
          <CheckIcon className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Order Confirmed</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900 tracking-tight">
            Thank You For Your Order
          </h1>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Your items have been reserved and prepared for bespoke dispatch. We've sent a detailed confirmation to your email.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-neutral-200/80 text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="text-neutral-500">Order Reference:</span>
            <span className="font-mono font-semibold text-neutral-900">{order._id}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="text-neutral-500">Payment Status:</span>
            <span className="font-semibold text-neutral-900">{order.payment?.method} ({order.payment?.status})</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="text-neutral-500">Delivery To:</span>
            <span className="font-semibold text-neutral-900">
              {order.shippingAddress?.fullName}, {order.shippingAddress?.city}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pt-3 border-t border-neutral-200">
            <span className="text-neutral-500">Total Payable:</span>
            <span className="text-base font-serif font-semibold text-neutral-900">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to={`/orders/${order._id}`}
            className="px-8 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs uppercase tracking-wider transition shadow-sm"
          >
            Track Order Details
          </Link>
          <Link
            to="/products"
            className="px-8 py-3.5 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold text-xs uppercase tracking-wider transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
