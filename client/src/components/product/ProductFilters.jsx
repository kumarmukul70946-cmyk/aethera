import React from "react";
import { StarIcon, CloseIcon, RotateCcwIcon } from "../common/Icons.jsx";

/**
 * Filter Sidebar & Mobile Drawer Component — Warm-light Japandi aesthetic.
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
  selectedDiscount = "",
  onChange,
  onReset,
  isOpenMobile = false,
  onCloseMobile
}) {
  const content = (
    <div className="space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <h3 className="font-bold text-neutral-900 text-base">Filter Catalog</h3>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition cursor-pointer"
        >
          <RotateCcwIcon className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Special Offers / Deals */}
      <div className="pb-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
          Promotions
        </h4>
        <button
          type="button"
          onClick={() => onChange("discount", selectedDiscount ? "" : "true")}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center justify-between cursor-pointer ${
            selectedDiscount
              ? "bg-amber-50 text-amber-950 border border-amber-300 font-semibold shadow-xs"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200/60"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${selectedDiscount ? "bg-amber-500 ring-2 ring-amber-300" : "bg-neutral-300"}`} />
            Deals & Offers Only
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900 font-bold uppercase tracking-wider">
            Sale
          </span>
        </button>
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Category
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onChange("category", "")}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs sm:text-sm transition flex items-center justify-between ${
              !selectedCategory
                ? "bg-neutral-900 text-white font-semibold shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
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
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs sm:text-sm transition flex items-center justify-between ${
                  isSelected
                    ? "bg-neutral-900 text-white font-semibold shadow-xs"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {typeof cat.productCount === "number" && (
                  <span className={`text-[10px] ml-2 ${isSelected ? "text-neutral-300" : "text-neutral-400"}`}>
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
        <div className="pt-4 border-t border-neutral-100">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Brand
          </h4>
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => onChange("brand", "")}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs sm:text-sm transition ${
                !selectedBrand
                  ? "bg-neutral-900 text-white font-semibold shadow-xs"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
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
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs sm:text-sm transition flex items-center justify-between ${
                    isSelected
                      ? "bg-neutral-900 text-white font-semibold shadow-xs"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
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
      <div className="pt-4 border-t border-neutral-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
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
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
          </div>
          <span className="text-neutral-400 text-xs">-</span>
          <div className="flex-1">
            <label htmlFor="max-price-input" className="sr-only">Max Price</label>
            <input
              id="max-price-input"
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onChange("maxPrice", e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Minimum Rating Filter */}
      <div className="pt-4 border-t border-neutral-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
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
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs sm:text-sm transition ${
                  isSelected
                    ? "bg-neutral-900 text-white font-semibold shadow-xs"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-3.5 h-3.5 ${i < stars ? "fill-amber-400 text-amber-400" : isSelected ? "text-neutral-600" : "text-neutral-300"}`}
                      filled={i < stars}
                    />
                  ))}
                  <span className={`text-xs ml-1.5 ${isSelected ? "text-white" : "text-neutral-600"}`}>
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
      <aside className="hidden lg:block w-64 shrink-0 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm sticky top-24 self-start">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs bg-white border-l border-neutral-200 p-6 flex flex-col h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <span className="font-bold text-lg text-neutral-900">Filters</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            {content}
            <div className="mt-8 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-2.5 rounded-full bg-neutral-900 text-white font-semibold text-xs transition hover:bg-neutral-800 shadow-sm"
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
