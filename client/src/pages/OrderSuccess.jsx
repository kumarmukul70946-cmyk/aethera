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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-8">
        {/* Animated Success Badge */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <CheckIcon className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Order Successfully Placed!
          </h1>
          <p className="text-sm text-slate-400">
            Thank you for shopping with Aethera Commerce. We've reserved your items.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="text-slate-400">Order Reference:</span>
            <span className="font-mono font-bold text-indigo-400">{order._id}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="text-slate-400">Payment Status:</span>
            <span className="font-semibold text-amber-400">{order.payment?.method} ({order.payment?.status})</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="text-slate-400">Delivery To:</span>
            <span className="font-semibold text-slate-200">
              {order.shippingAddress?.fullName}, {order.shippingAddress?.city}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-400">Total Paid/Due:</span>
            <span className="text-base font-bold text-white">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link
            to={`/orders/${order._id}`}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25"
          >
            Track Order Details
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
