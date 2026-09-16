import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons.jsx";

/**
 * Accessible, responsive pagination controls — Warm-light Japandi aesthetic.
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
    const delta = 1;

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
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-neutral-200/80 mt-10"
    >
      {/* Items summary */}
      <div className="text-xs sm:text-sm text-neutral-500">
        Showing <span className="font-semibold text-neutral-900">{startItem}</span> to{" "}
        <span className="font-semibold text-neutral-900">{endItem}</span> of{" "}
        <span className="font-semibold text-neutral-900">{total}</span> products
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex items-center justify-center w-9 h-9 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:text-white hover:bg-neutral-900 hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs"
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
                  className="px-2 py-1 text-neutral-400 select-none text-xs"
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
                className={`min-w-9 h-9 px-3 rounded-full text-xs font-semibold transition ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300"
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
          className="flex items-center justify-center w-9 h-9 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:text-white hover:bg-neutral-900 hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
