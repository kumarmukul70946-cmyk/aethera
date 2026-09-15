import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrderById,
  cancelOrder,
  clearSelectedOrder,
  selectSelectedOrder,
  selectOrderDetailLoading,
  selectCancelLoading
} from "../features/orders/orderSlice.js";
import OrderStatusTimeline from "../components/order/OrderStatusTimeline.jsx";
import { formatCurrency } from "../utils/formatters.js";
import { TruckIcon, ShieldCheckIcon, AlertCircleIcon } from "../components/common/Icons.jsx";
import ErrorState from "../components/common/ErrorState.jsx";

export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const order = useSelector(selectSelectedOrder);
  const loading = useSelector(selectOrderDetailLoading);
  const cancelLoading = useSelector(selectCancelLoading);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch, id]);

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel this order? Any deducted inventory will be immediately restored."
      )
    ) {
      dispatch(cancelOrder(id));
    }
  };

  if (loading || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading order details...</p>
      </div>
    );
  }

  const isCancelable = ["PENDING", "CONFIRMED", "PROCESSING"].includes(
    order.status
  );

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
        >
          ← Back to All Orders
        </Link>
        <span className="text-xs text-slate-500">Order ID: {order._id}</span>
      </div>

      {/* Header Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Placed on {orderDate}</p>
          </div>

          {isCancelable && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelLoading}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition self-start sm:self-auto"
            >
              {cancelLoading ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>

        {/* Status Timeline */}
        <OrderStatusTimeline status={order.status} />
      </div>

      {/* Two-Column Details Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Columns: Purchased Items Snapshot */}
        <div className="md:col-span-2 space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 pb-3 border-b border-slate-800">
            Purchased Items ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-slate-800/60">
            {order.items?.map((item) => {
              const productUrl = item.product?.slug
                ? `/product/${item.product.slug}`
                : `/products/${item.product?._id || item.product}`;

              return (
                <div key={item._id} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <h4 className="font-semibold text-sm text-slate-200 truncate hover:text-indigo-400">
                      <Link to={productUrl}>{item.name}</Link>
                    </h4>
                    {item.customization && (
                      <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex flex-wrap gap-2">
                          {item.customization.color && <span>Color: {item.customization.color}</span>}
                          {item.customization.size && <span>• Size: {item.customization.size}</span>}
                        </div>
                        {item.customization.custom3D && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {Object.entries(item.customization.custom3D).map(([areaId, choice]) => (
                              <span
                                key={areaId}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-medium"
                              >
                                <span
                                  style={{ backgroundColor: choice.color }}
                                  className="w-2 h-2 rounded-full border border-black/40 shrink-0"
                                />
                                <span className="capitalize text-slate-400">{areaId}:</span>
                                <strong className="text-white">{choice.name}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-slate-400">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-white shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Address Snapshot & Payment Summary */}
        <div className="space-y-6">
          {/* Shipping Address Snapshot */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Delivery Address Snapshot
            </h4>
            <p className="text-sm font-bold text-white">
              {order.shippingAddress?.fullName}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {order.shippingAddress?.addressLine}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
              {order.shippingAddress?.postalCode}
              <br />
              {order.shippingAddress?.country}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              Phone: {order.shippingAddress?.phone}
            </p>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Invoice Summary
            </h4>

            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-200 font-semibold">{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount Applied</span>
                <span className="font-semibold">-{formatCurrency(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Delivery Fee</span>
              <span className="text-emerald-400 font-semibold">Free</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Payment Mode</span>
              <span className="text-amber-400 font-semibold">{order.payment?.method}</span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
              <span>Grand Total</span>
              <span className="text-base text-indigo-400">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
