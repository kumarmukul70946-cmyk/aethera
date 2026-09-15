import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { similarProductService } from "../../services/similarProductService.js";
import ProductCard from "./ProductCard.jsx";
import ProductCardSkeleton from "../common/ProductCardSkeleton.jsx";
import { SparklesIcon } from "../common/Icons.jsx";

/**
 * SimilarProducts Component (Part 14 — Product Embeddings & Semantic Similarity)
 *
 * Displays products semantically related by meaning, attributes, and specifications.
 * Lazy, non-blocking: If the API fails or returns no products, gracefully collapses
 * without degrading the Product Details page.
 *
 * @param {Object} props
 * @param {string} props.productId - The active product ObjectId
 * @param {string} [props.title="You May Also Like"] - Section heading
 * @param {string} [props.subtitle="Curated through semantic embeddings and vector similarity"] - Subheading
 * @param {number} [props.limit=4] - Number of items to display
 * @param {string} [props.className=""] - Additional class styling
 */
export default function SimilarProducts({
  productId,
  title = "You May Also Like",
  subtitle = "Semantically matching products based on features, specifications, and design",
  limit = 4,
  className = ""
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasError(false);

    similarProductService
      .getSimilarProducts(productId, limit)
      .then((items) => {
        if (isMounted) {
          setProducts(Array.isArray(items) ? items : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("[SimilarProducts] Non-critical similarity retrieval notice:", err.message);
          setHasError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId, limit]);

  // Gracefully degrade: if an error occurred or no products returned after loading, render nothing
  if (hasError) return null;
  if (!loading && (!products || products.length === 0)) return null;

  return (
    <section className={`py-8 sm:py-12 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-2">
            <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Semantic Similarity</span>
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
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 group self-start sm:self-auto"
        >
          <span>Browse Catalog</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Product Shelf Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, limit).map((prod, idx) => (
            <motion.div
              key={prod._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex flex-col h-full"
            >
              {/* Semantic Similarity Signal Badge */}
              {prod.similarityScore !== undefined && prod.similarityScore !== null && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800/80 border border-cyan-500/30 text-cyan-300 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>{Math.round(prod.similarityScore * 100)}% Semantic Match</span>
                  </span>
                </div>
              )}

              {/* Product Card */}
              <div className="flex-1">
                <ProductCard product={prod} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
