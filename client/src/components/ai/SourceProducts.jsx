import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters.js";

/**
 * Renders verified source product cards attached to a grounded assistant response.
 *
 * @param {Object} props
 * @param {Array<Object>} props.sources - List of verified product sources from database
 */
export default function SourceProducts({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-700/50">
      <div className="flex items-center gap-1.5 mb-2">
        <svg
          className="w-3.5 h-3.5 text-cyan-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
          Catalog Sources ({sources.length})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {sources.map((product) => {
          const targetUrl = product.slug
            ? `/product/${product.slug}`
            : `/products/${product.id}`;

          const primaryImg =
            product.images && product.images.length > 0
              ? typeof product.images[0] === "string"
                ? product.images[0]
                : product.images[0].url
              : null;

          const isOutOfStock = product.stock <= 0;

          return (
            <Link
              key={product.id}
              to={targetUrl}
              className="group flex items-center gap-3 p-2 rounded-xl bg-slate-900/70 hover:bg-slate-750 border border-slate-700/60 hover:border-cyan-500/50 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700/40 flex items-center justify-center">
                {primaryImg ? (
                  <img
                    src={primaryImg}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs text-slate-500">No Img</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                  {product.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {product.brand}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-amber-400">
                    {formatCurrency(product.finalPrice || product.price)}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      isOutOfStock
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
