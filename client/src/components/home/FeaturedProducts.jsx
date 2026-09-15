import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchFeaturedProducts } from "../../features/products/productSlice.js";
import { selectFeaturedProducts } from "../../features/products/productSelectors.js";
import ProductCard from "../product/ProductCard.jsx";
import ProductCardSkeleton from "../common/ProductCardSkeleton.jsx";
import { ArrowRightIcon, RefreshIcon } from "../common/Icons.jsx";

/**
 * FeaturedProducts
 * Displays curated flagship products. Isolated error handling ensures that
 * an API failure in this section does not crash or block the rest of the homepage.
 */
export default function FeaturedProducts() {
  const dispatch = useDispatch();
  const featured = useSelector(selectFeaturedProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = () => {
    // If Redux already has featured products cached, avoid unnecessary refetching
    if (featured && featured.length > 0) return;

    setLoading(true);
    setError(null);
    dispatch(fetchFeaturedProducts({ limit: 4 }))
      .unwrap()
      .catch((err) => {
        setError(err || "Unable to load featured products at this time.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Staff Picks
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Featured Products
          </h2>
        </div>
        <Link
          to="/products"
          className="group text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5"
        >
          <span>View All Products</span>
          <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Loading Skeleton */}
      {loading && (!featured || featured.length === 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error Fallback */}
      {error && (!featured || featured.length === 0) && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
          <p className="text-xs text-slate-400">{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      )}

      {/* Products Grid */}
      {featured && featured.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featured.slice(0, 4).map((product) => (
            <ProductCard key={product._id || product.slug} product={product} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
