import React from "react";
import { CheckIcon, CloseIcon } from "../common/Icons.jsx";

const STEPS = [
  { key: "PENDING", label: "Order Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" }
];

export default function OrderStatusTimeline({ status = "PENDING" }) {
  const isCancelled = status === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700">
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
          <CloseIcon className="w-4 h-4 text-rose-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Order Cancelled</h4>
          <p className="text-xs text-rose-600/80">
            This order was cancelled. Any deducted stock has been restored.
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === status);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting Progress Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-200 -z-0">
          <div
            className="h-full bg-neutral-900 transition-all duration-500"
            style={{
              width: `${(activeIndex / (STEPS.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Steps */}
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition border ${
                  isDone
                    ? "bg-neutral-900 border-neutral-900 text-white"
                    : isCurrent
                    ? "bg-white border-2 border-neutral-900 ring-4 ring-neutral-900/10 text-neutral-900 font-bold"
                    : "bg-neutral-100 border-neutral-200 text-neutral-400"
                }`}
              >
                {isDone ? (
                  <CheckIcon className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium mt-2 text-center hidden md:inline-block max-w-[84px] ${
                  isCurrent
                    ? "text-neutral-900 font-semibold"
                    : isDone
                    ? "text-neutral-700"
                    : "text-neutral-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile status label */}
      <div className="text-center mt-4 md:hidden">
        <span className="text-xs text-neutral-400">Current Status: </span>
        <span className="text-xs font-semibold text-neutral-900">
          {STEPS[activeIndex]?.label || status}
        </span>
      </div>
    </div>
  );
}
