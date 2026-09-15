import React from "react";
import { FilterIcon } from "./Icons.jsx";

/**
 * EmptyState display when queries/filters yield no products.
 * @param {Object} props
 * @param {string} [props.title="No products found"]
 * @param {string} [props.message="We couldn't find any products matching your current filters."]
 * @param {string} [props.actionLabel="Reset all filters"]
 * @param {Function} [props.onAction]
 */
export default function EmptyState({
  title = "No products found",
  message = "We couldn't find any products matching your current filters. Try changing or clearing your criteria.",
  actionLabel = "Reset all filters",
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/40 border border-slate-800/80 rounded-3xl my-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
        <FilterIcon className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
        {message}
      </p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/25"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
