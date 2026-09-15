import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons.jsx";

/**
 * Accessible, responsive pagination controls.
 * @param {Object} props
 * @param {number} props.page - Current page (1-indexed)
 * @param {number} props.totalPages - Total pages available
 * @param {number} [props.total] - Total items count
 * @param {number} [props.limit=12] - Items per page
 * @param {Function} props.onPageChange - Callback receiving new page number
 */
export default function Pagination({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 12,
  onPageChange
}) {
  if (totalPages <= 1) return null;

  // Compute smart page list
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // Number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const pages = getPageNumbers();
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Product pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-slate-800/80 mt-10"
    >
      {/* Items summary */}
      <div className="text-sm text-slate-400">
        Showing <span className="font-medium text-slate-200">{startItem}</span> to{" "}
        <span className="font-medium text-slate-200">{endItem}</span> of{" "}
        <span className="font-medium text-slate-200">{total}</span> products
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((item, index) => {
            if (item === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-slate-500 select-none text-sm"
                >
                  ...
                </span>
              );
            }

            const isActive = item === page;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={isActive ? "page" : undefined}
                className={`min-w-9 h-9 px-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "border border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
