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
 * Dropdown component to sort catalog products.
 * @param {Object} props
 * @param {string} props.value - Currently selected sort option
 * @param {Function} props.onChange - Handler called on sort change
 */
export default function ProductSort({ value = "newest", onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="product-sort-select" className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:inline flex items-center gap-1">
        <SlidersIcon className="w-3.5 h-3.5 text-slate-500" />
        Sort by:
      </label>
      <select
        id="product-sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-950 text-slate-200">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
