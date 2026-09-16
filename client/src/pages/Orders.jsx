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
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  CONFIRMED: "bg-neutral-100 text-neutral-800 border-neutral-200",
  PROCESSING: "bg-blue-50 text-blue-800 border-blue-200",
  SHIPPED: "bg-teal-50 text-teal-800 border-teal-200",
  OUT_FOR_DELIVERY: "bg-purple-50 text-purple-800 border-purple-200",
  DELIVERED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-800 border-rose-200"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Title */}
      <div className="pb-6 border-b border-neutral-200/80 mb-8">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Order History</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900 tracking-tight mt-1">
          Your Purchases
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Review your purchase history, invoices, and shipment progress
        </p>
      </div>

      {loading && orders.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-neutral-500">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-12 sm:p-16 bg-white border border-neutral-200/80 rounded-3xl shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto">
            <CubeIcon className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-normal text-neutral-900">No orders yet</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            When you complete purchases, your order receipts and delivery tracking will appear here.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {orders.map((order) => {
              const statusClass =
                STATUS_COLORS[order.status] ||
                "bg-neutral-100 text-neutral-800 border-neutral-200";

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
                  className="bg-white hover:border-neutral-300 border border-neutral-200/80 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-neutral-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusClass}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-neutral-400">
                        Placed on {orderDate}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600">
                      {order.items?.length || 0}{" "}
                      {order.items?.length === 1 ? "item" : "items"} (
                      {order.items?.map((it) => it.name).join(", ").slice(0, 70)}
                      {order.items?.length > 1 ? "..." : ""})
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
                        Total Amount
                      </p>
                      <p className="text-base font-serif font-medium text-neutral-900">
                        {formatCurrency(order.total)}
                      </p>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm"
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
