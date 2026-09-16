import React from "react";
import { FilterIcon } from "./Icons.jsx";

/**
 * EmptyState display when queries/filters yield no products — Warm-light Japandi style.
 */
export default function EmptyState({
  title = "No products found",
  message = "We couldn't find any products matching your current filters. Try changing or clearing your criteria.",
  actionLabel = "Reset all filters",
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-neutral-200/80 rounded-3xl my-8 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center justify-center mb-4">
        <FilterIcon className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 max-w-md text-xs sm:text-sm mb-6 leading-relaxed font-light">
        {message}
      </p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
