import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth.js";
import {
  fetchHomeRecommendations,
  fetchContextRecommendations,
  selectHomeRecommendations,
  selectHomeRecommendationsLoading,
  selectContextRecommendations,
  selectContextRecommendationsLoading
} from "../../features/recommendations/recommendationSlice.js";
import ProductCard from "./ProductCard.jsx";
import ProductCardSkeleton from "../common/ProductCardSkeleton.jsx";
import { SparklesIcon } from "../common/Icons.jsx";

/**
 * RecommendedProducts Component (Part 13 — Recommendation Engine)
 *
 * Displays personalized product recommendations with explainable AI reason badges.
 * Renders on Homepage (personalized discovery) and Product Details (complementary context).
 *
 * Resilience: If unauthenticated or if the request fails, gracefully degrades without
 * breaking the host page.
 */
export default function RecommendedProducts({
  contextProductId = null,
  title = "Recommended for You",
  subtitle = "Personalized selections based on your browsing and shopping intent",
  limit = 4,
  className = ""
}) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  const homeRecommendations = useSelector(selectHomeRecommendations);
  const homeLoading = useSelector(selectHomeRecommendationsLoading);

  const contextRecommendations = useSelector((state) =>
    selectContextRecommendations(state, contextProductId)
  );
  const contextLoading = useSelector(selectContextRecommendationsLoading);

  const isContextMode = Boolean(contextProductId);
  const items = isContextMode ? contextRecommendations : homeRecommendations;
  const loading = isContextMode ? contextLoading : homeLoading;

  useEffect(() => {
    // Only query recommendations when authenticated
    if (!isAuthenticated) return;

    if (isContextMode) {
      dispatch(fetchContextRecommendations({ contextProductId, limit }));
    } else {
      dispatch(fetchHomeRecommendations({ limit }));
    }
  }, [dispatch, isAuthenticated, isContextMode, contextProductId, limit]);

  // If unauthenticated or no recommendations exist after load, hide cleanly
  if (!isAuthenticated) return null;
  if (!loading && (!items || items.length === 0)) return null;

  return (
    <section className={`py-8 sm:py-12 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-2">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Behavioral Matching</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          to="/products"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 group self-start sm:self-auto"
        >
          <span>Explore All</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Product Shelf Grid */}
      {loading && (!items || items.length === 0) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, limit).map(({ product, reason, score }, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex flex-col h-full"
            >
              {/* Explainable Reason Badge */}
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800/80 border border-slate-700/60 text-cyan-300 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="truncate max-w-[220px]">{reason}</span>
                </span>
              </div>

              {/* Standard Product Card */}
              <div className="flex-1">
                <ProductCard product={product} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
