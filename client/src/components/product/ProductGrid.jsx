import React from "react";
import ProductCard from "./ProductCard.jsx";
import ProductGridSkeleton from "../common/ProductGridSkeleton.jsx";
import EmptyState from "../common/EmptyState.jsx";
import ErrorState from "../common/ErrorState.jsx";

/**
 * Reusable Product Grid Component.
 * Handles rendering list of cards, loading skeletons, error states, and empty states.
 */
export default function ProductGrid({
  products = [],
  loading = false,
  error = null,
  skeletonCount = 8,
  emptyTitle,
  emptyMessage,
  onResetFilters,
  onRetry
}) {
  if (loading) {
    return <ProductGridSkeleton count={skeletonCount} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id || product.slug} product={product} />
      ))}
    </div>
  );
}
