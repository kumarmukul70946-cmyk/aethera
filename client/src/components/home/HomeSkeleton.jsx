import React from "react";
import ProductCardSkeleton from "../common/ProductCardSkeleton.jsx";

/**
 * Skeleton placeholder for the Hero section.
 */
export function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden pt-12 md:pt-16 lg:pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Left Column Skeleton */}
          <div className="lg:col-span-7 space-y-6 animate-pulse">
            <div className="h-6 w-48 bg-slate-800/80 rounded-full" />
            <div className="space-y-3">
              <div className="h-12 w-4/5 bg-slate-800 rounded-2xl" />
              <div className="h-12 w-3/5 bg-slate-800/70 rounded-2xl" />
            </div>
            <div className="h-16 w-full max-w-xl bg-slate-800/40 rounded-xl" />
            <div className="flex gap-4 pt-2">
              <div className="h-12 w-36 bg-slate-800 rounded-2xl" />
              <div className="h-12 w-36 bg-slate-800/60 rounded-2xl" />
            </div>
          </div>

          {/* 3D Viewport Right Column Skeleton */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[420px] aspect-square rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Skeleton placeholder for the Category Grid.
 */
export function CategoryGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-800" />
            <div className="w-12 h-4 rounded-full bg-slate-800/80" />
          </div>
          <div className="space-y-2">
            <div className="w-24 h-4 bg-slate-800 rounded" />
            <div className="w-36 h-3 bg-slate-800/60 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton placeholder for Featured / Trending product grids.
 */
export function ProductSectionSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Full page skeleton representing initial Home state if needed.
 */
export default function HomeSkeleton() {
  return (
    <div className="space-y-24 pb-20">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <ProductSectionSkeleton count={4} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <CategoryGridSkeleton count={8} />
      </div>
    </div>
  );
}
