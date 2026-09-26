import React from "react";

const ASSET_TYPES = [
  { id: "ALL", label: "All Assets" },
  { id: "MODEL_3D", label: "3D Models (.glb)" },
  { id: "PRODUCT_IMAGE", label: "Primary Images" },
  { id: "PRODUCT_GALLERY", label: "Gallery" },
  { id: "PRODUCT_THUMBNAIL", label: "Thumbnails" }
];

/**
 * Filter toolbar for media and 3D asset catalog.
 */
export default function AssetFilters({
  search,
  onSearchChange,
  assetType,
  onAssetTypeChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  totalCount = 0
}) {
  return (
    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl space-y-4">
      {/* Top Search & Dropdown Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <svg
            className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search assets by filename..."
            className="w-full bg-neutral-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Dropdowns: Status & Sort */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-neutral-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">Status: Active</option>
            <option value="ORPHANED">Status: Orphaned (Unlinked)</option>
          </select>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-neutral-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-size">Largest Size</option>
            <option value="size">Smallest Size</option>
          </select>

          <span className="hidden md:inline-block px-3 py-2 rounded-xl bg-neutral-950/40 border border-white/5 text-xs text-neutral-400 font-mono">
            {totalCount} item(s)
          </span>
        </div>
      </div>

      {/* Type Pill Filter Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-white/5 scrollbar-none">
        {ASSET_TYPES.map((type) => {
          const isActive = assetType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => onAssetTypeChange(type.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "bg-neutral-950/60 text-neutral-400 hover:text-neutral-200 border border-white/5"
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
