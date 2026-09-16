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
        <div className="w-10 h-10 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-neutral-500">Loading order details...</p>
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition flex items-center gap-1"
        >
          ← Back to All Orders
        </Link>
        <span className="text-xs font-mono text-neutral-400">Order ID: {order._id}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">Order Summary</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-900 tracking-tight mt-0.5">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-neutral-500 mt-1">Placed on {orderDate}</p>
          </div>

          {isCancelable && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelLoading}
              className="px-5 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold uppercase tracking-wider transition self-start sm:self-auto"
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
        <div className="md:col-span-2 space-y-4 bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 pb-3 border-b border-neutral-100">
            Purchased Items ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-neutral-100">
            {order.items?.map((item) => {
              const productUrl = item.product?.slug
                ? `/product/${item.product.slug}`
                : `/products/${item.product?._id || item.product}`;

              return (
                <div key={item._id} className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <h4 className="font-medium text-sm text-neutral-900 truncate hover:text-neutral-600 transition">
                      <Link to={productUrl}>{item.name}</Link>
                    </h4>
                    {item.customization && (
                      <div className="text-xs text-neutral-500 space-y-1">
                        <div className="flex flex-wrap gap-2">
                          {item.customization.color && <span>Color: {item.customization.color}</span>}
                          {item.customization.size && <span>• Size: {item.customization.size}</span>}
                        </div>
                        {item.customization.custom3D && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {Object.entries(item.customization.custom3D).map(([areaId, choice]) => (
                              <span
                                key={areaId}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] text-neutral-700 font-medium"
                              >
                                <span
                                  style={{ backgroundColor: choice.color }}
                                  className="w-2 h-2 rounded-full border border-black/20 shrink-0"
                                />
                                <span className="capitalize text-neutral-400">{areaId}:</span>
                                <strong className="text-neutral-900">{choice.name}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-neutral-400">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-medium font-serif text-sm text-neutral-900 shrink-0">
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
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-2 shadow-sm">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Delivery Destination
            </h4>
            <p className="text-sm font-semibold text-neutral-900">
              {order.shippingAddress?.fullName}
            </p>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {order.shippingAddress?.addressLine}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} &mdash;{" "}
              {order.shippingAddress?.postalCode}
              <br />
              {order.shippingAddress?.country}
            </p>
            <p className="text-xs text-neutral-400 pt-1">
              Phone: {order.shippingAddress?.phone}
            </p>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 space-y-3.5 text-xs shadow-sm">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-100">
              Invoice Summary
            </h4>

            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="text-neutral-900 font-semibold">{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-neutral-900">
                <span className="text-emerald-600">Discount Applied</span>
                <span className="font-semibold text-emerald-600">-{formatCurrency(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>Delivery Fee</span>
              <span className="text-neutral-900 font-semibold">Complimentary</span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span>Payment Mode</span>
              <span className="text-neutral-900 font-semibold">{order.payment?.method}</span>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-between text-sm font-semibold text-neutral-900">
              <span>Grand Total</span>
              <span className="text-base font-serif font-normal text-neutral-900">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
