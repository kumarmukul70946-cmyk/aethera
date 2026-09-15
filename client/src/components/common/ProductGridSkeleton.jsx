import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton.jsx";

/**
 * Grid of skeletons rendered during initial catalog data loading.
 * @param {Object} props
 * @param {number} [props.count=8] - Number of skeleton cards to render
 */
export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
