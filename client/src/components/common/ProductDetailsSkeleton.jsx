import React from "react";

/**
 * Skeleton loader for the ProductDetails page.
 */
export default function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-slate-800 rounded mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="w-full aspect-square bg-slate-800/80 rounded-3xl" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-800/60 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Product Info Column */}
        <div className="space-y-6">
          <div>
            <div className="h-4 w-28 bg-slate-800 rounded mb-2" />
            <div className="h-8 w-3/4 bg-slate-800 rounded mb-4" />
            <div className="h-5 w-36 bg-slate-800/60 rounded" />
          </div>

          <div className="h-10 w-48 bg-slate-800 rounded" />

          <div className="space-y-2 pt-4 border-t border-slate-800">
            <div className="h-4 w-full bg-slate-800/60 rounded" />
            <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
            <div className="h-4 w-4/6 bg-slate-800/60 rounded" />
          </div>

          {/* Variants */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="h-4 w-24 bg-slate-800 rounded" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-slate-800" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <div className="h-12 flex-1 bg-slate-800 rounded-xl" />
            <div className="h-12 w-14 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
