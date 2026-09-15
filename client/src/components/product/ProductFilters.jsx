import React from "react";
import { StarIcon, CloseIcon, RotateCcwIcon } from "../common/Icons.jsx";

/**
 * Filter Sidebar & Mobile Drawer Component.
 */
export default function ProductFilters({
  categories = [],
  brands = [],
  priceRange = { min: 0, max: 200000 },
  selectedCategory = "",
  selectedBrand = "",
  minPrice = "",
  maxPrice = "",
  selectedRating = "",
  onChange,
  onReset,
  isOpenMobile = false,
  onCloseMobile
}) {
  const content = (
    <div className="space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h3 className="font-bold text-slate-100 text-base">Filter Catalog</h3>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          <RotateCcwIcon className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Category
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onChange("category", "")}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition flex items-center justify-between ${
              !selectedCategory
                ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <span>All Categories</span>
          </button>

          {categories.map((cat) => {
            const isSelected =
              selectedCategory === cat.slug || selectedCategory === cat._id;
            return (
              <button
                key={cat._id}
                type="button"
                onClick={() => onChange("category", cat.slug)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {typeof cat.productCount === "number" && (
                  <span className="text-[11px] text-slate-500 ml-2">
                    {cat.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands Filter */}
      {brands.length > 0 && (
        <div className="pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Brand
          </h4>
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => onChange("brand", "")}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition ${
                !selectedBrand
                  ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              All Brands
            </button>

            {brands.map((brand) => {
              const isSelected = selectedBrand === brand;
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onChange("brand", brand)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition flex items-center justify-between ${
                    isSelected
                      ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span className="truncate">{brand}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="pt-4 border-t border-slate-800/80">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Price Range (₹)
        </h4>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label htmlFor="min-price-input" className="sr-only">Min Price</label>
            <input
              id="min-price-input"
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onChange("minPrice", e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-slate-600 text-xs">-</span>
          <div className="flex-1">
            <label htmlFor="max-price-input" className="sr-only">Max Price</label>
            <input
              id="max-price-input"
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onChange("maxPrice", e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Minimum Rating Filter */}
      <div className="pt-4 border-t border-slate-800/80">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Customer Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((stars) => {
            const isSelected = Number(selectedRating) === stars;
            return (
              <button
                key={stars}
                type="button"
                onClick={() =>
                  onChange("rating", isSelected ? "" : stars.toString())
                }
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition ${
                  isSelected
                    ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-3.5 h-3.5"
                      filled={i < stars}
                    />
                  ))}
                  <span className="text-xs text-slate-300 ml-1.5">
                    {stars}★ & above
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sticky top-24 self-start">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs bg-slate-950 border-l border-slate-800 p-6 flex flex-col h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <span className="font-bold text-lg text-white">Filters</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            {content}
            <div className="mt-8 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm transition hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
