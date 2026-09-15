import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  selectOrders,
  selectOrderPagination,
  selectOrderLoading
} from "../features/orders/orderSlice.js";
import { formatCurrency } from "../utils/formatters.js";
import Pagination from "../components/common/Pagination.jsx";
import { CubeIcon, ArrowRightIcon } from "../components/common/Icons.jsx";

const STATUS_COLORS = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROCESSING: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  SHIPPED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  OUT_FOR_DELIVERY: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20"
};

export default function Orders() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const orders = useSelector(selectOrders);
  const pagination = useSelector(selectOrderPagination);
  const loading = useSelector(selectOrderLoading);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    dispatch(fetchOrders({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title */}
      <div className="pb-6 border-b border-slate-800 mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Your Orders
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your purchase history, invoices, and shipment progress
        </p>
      </div>

      {loading && orders.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <CubeIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">No orders yet</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            When you complete purchases, your order receipts and delivery tracking will appear here.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            {orders.map((order) => {
              const statusClass =
                STATUS_COLORS[order.status] ||
                "bg-slate-800 text-slate-300 border-slate-700";

              const orderDate = new Date(order.createdAt).toLocaleDateString(
                "en-IN",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                }
              );

              return (
                <div
                  key={order._id}
                  className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 rounded-2xl p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusClass}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        Placed on {orderDate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      {order.items?.length || 0}{" "}
                      {order.items?.length === 1 ? "item" : "items"} (
                      {order.items?.map((it) => it.name).join(", ").slice(0, 70)}
                      {order.items?.length > 1 ? "..." : ""})
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">
                        Total Amount
                      </p>
                      <p className="text-base font-bold text-white">
                        {formatCurrency(order.total)}
                      </p>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition"
                    >
                      <span>View Order</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
