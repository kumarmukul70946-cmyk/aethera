import React from "react";

/**
 * Skeleton loader representing a single ProductCard during data fetch — Warm-light Japandi style.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 flex flex-col animate-pulse shadow-xs">
      {/* Image Skeleton */}
      <div className="w-full aspect-square bg-neutral-100 rounded-xl mb-4" />

      {/* Brand & Rating Skeleton */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="h-3 w-16 bg-neutral-100 rounded-full" />
        <div className="h-3 w-10 bg-neutral-100 rounded-full" />
      </div>

      {/* Title Skeleton */}
      <div className="h-4 w-3/4 bg-neutral-200 rounded mb-2" />
      <div className="h-3 w-1/2 bg-neutral-100 rounded mb-4" />

      {/* Price & Action Skeleton */}
      <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between">
        <div className="h-5 w-20 bg-neutral-200 rounded" />
        <div className="h-7 w-16 bg-neutral-100 rounded-full" />
      </div>
    </div>
  );
}
