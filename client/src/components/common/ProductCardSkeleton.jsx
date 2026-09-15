import React from "react";

/**
 * Skeleton loader representing a single ProductCard during data fetch.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-square bg-slate-800/70 rounded-xl mb-4" />

      {/* Brand & Rating Skeleton */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="h-3.5 w-20 bg-slate-800 rounded" />
        <div className="h-3.5 w-12 bg-slate-800 rounded" />
      </div>

      {/* Title Skeleton */}
      <div className="h-5 w-3/4 bg-slate-800 rounded mb-2" />
      <div className="h-4 w-1/2 bg-slate-800/60 rounded mb-4" />

      {/* Price & Action Skeleton */}
      <div className="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <div className="h-6 w-24 bg-slate-800 rounded" />
        <div className="h-9 w-9 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
