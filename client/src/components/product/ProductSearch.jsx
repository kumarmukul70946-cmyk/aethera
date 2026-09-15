import React from "react";
import { SearchIcon, CloseIcon } from "../common/Icons.jsx";

/**
 * Reusable search bar component for product search.
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
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-11 pr-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
        />
        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />

        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Clear search query"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
