import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchCategories } from "../../features/products/productSlice.js";
import { selectCategories } from "../../features/products/productSelectors.js";
import { CategoryGridSkeleton } from "./HomeSkeleton.jsx";
import { CubeIcon, ArrowRightIcon, RefreshIcon } from "../common/Icons.jsx";

/**
 * CategoryShowcase
 * Dynamic category cards fetched from the backend API.
 * Links to filtered catalog searches without full page reloads.
 */
export default function CategoryShowcase() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCategories = () => {
    // Reuse existing categories in Redux if already loaded by CustomerLayout
    if (categories && categories.length > 0) return;

    setLoading(true);
    setError(null);
    dispatch(fetchCategories())
      .unwrap()
      .catch((err) => {
        setError(err || "Unable to load product categories.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCategories();
  }, [dispatch]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Department Domains
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Browse by Category
          </h2>
        </div>
        <Link
          to="/products"
          className="group text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5"
        >
          <span>All Categories</span>
          <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Loading Skeleton */}
      {loading && (!categories || categories.length === 0) && (
        <CategoryGridSkeleton count={8} />
      )}

      {/* Error Fallback */}
      {error && (!categories || categories.length === 0) && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
          <p className="text-xs text-slate-400">{error}</p>
          <button
            type="button"
            onClick={loadCategories}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      )}

      {/* Category Grid */}
      {categories && categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat._id || cat.slug}
              to={`/products?category=${encodeURIComponent(cat.slug || cat.name.toLowerCase())}`}
              className="group relative bg-slate-900/40 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-5 transition flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 active:scale-[0.99]"
            >
              {/* Card Top Icon & Count */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/20 transition duration-300">
                  <CubeIcon className="w-5 h-5" />
                </div>
                {typeof cat.productCount === "number" && (
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800">
                    {cat.productCount} items
                  </span>
                )}
              </div>

              {/* Card Text Information */}
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-slate-200 group-hover:text-white transition flex items-center justify-between">
                  <span>{cat.name}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                  {cat.description || "Discover premium products"}
                </p>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </section>
  );
}
