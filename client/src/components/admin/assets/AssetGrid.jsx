import React from "react";
import AssetCard from "./AssetCard.jsx";

/**
 * Responsive grid renderer for assets with loading skeletons and pagination.
 */
export default function AssetGrid({
  assets,
  loading,
  pagination,
  onPageChange,
  onPreview,
  onReplace,
  onDelete
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-2xl bg-neutral-900/60 border border-white/5"
          />
        ))}
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-neutral-900/40 border border-white/5 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center text-xl mx-auto">
          📁
        </div>
        <h4 className="text-base font-bold text-neutral-200">No assets found</h4>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          No media or 3D models match your current filter settings. Upload new assets or clear your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {assets.map((asset) => (
          <AssetCard
            key={asset._id}
            asset={asset}
            onPreview={onPreview}
            onReplace={onReplace}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900/60 border border-white/5 text-xs text-neutral-400">
          <span>
            Showing page <strong className="text-white">{pagination.page}</strong> of{" "}
            <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} total)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-40 disabled:pointer-events-none transition"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-40 disabled:pointer-events-none transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
