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
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400">
        <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
          <CloseIcon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold">Order Cancelled</h4>
          <p className="text-xs text-rose-400/80">
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
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0">
          <div
            className="h-full bg-indigo-600 transition-all duration-500"
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
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : isCurrent
                    ? "bg-slate-950 border-indigo-500 ring-4 ring-indigo-500/20 text-indigo-400 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                }`}
              >
                {isDone ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold mt-2 text-center hidden md:inline-block max-w-[80px] ${
                  isCurrent
                    ? "text-indigo-400 font-bold"
                    : isDone
                    ? "text-slate-200"
                    : "text-slate-500"
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
        <span className="text-xs text-slate-400">Current Status: </span>
        <span className="text-xs font-bold text-indigo-400">
          {STEPS[activeIndex]?.label || status}
        </span>
      </div>
    </div>
  );
}
