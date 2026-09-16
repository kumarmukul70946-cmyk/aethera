import React from "react";
import { SlidersIcon } from "../common/Icons.jsx";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" }
];

/**
 * Dropdown component to sort catalog products — Warm-light Japandi aesthetic.
 */
export default function ProductSort({ value = "newest", onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="product-sort-select" className="text-xs text-neutral-500 font-medium whitespace-nowrap hidden sm:inline flex items-center gap-1">
        <SlidersIcon className="w-3.5 h-3.5 text-neutral-400" />
        Sort:
      </label>
      <select
        id="product-sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-full px-4 py-1.5 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-900 cursor-pointer shadow-xs transition"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-white text-neutral-800">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
