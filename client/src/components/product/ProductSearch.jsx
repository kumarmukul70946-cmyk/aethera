import React from "react";
import { SearchIcon, CloseIcon } from "../common/Icons.jsx";

/**
 * Reusable search bar component for product search — Warm-light Japandi style.
 */
export default function ProductSearch({
  value = "",
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search by brand, name, or keyword..."
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-neutral-200 rounded-full pl-12 pr-10 py-3.5 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 shadow-xs transition"
        />
        <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none" />

        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
            aria-label="Clear search query"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
