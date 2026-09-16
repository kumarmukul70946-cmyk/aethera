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
    <div className="mt-3 pt-3 border-t border-neutral-100">
      <div className="flex items-center gap-1.5 mb-2">
        <svg
          className="w-3.5 h-3.5 text-neutral-800"
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
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Catalog Sources ({sources.length})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              className="group flex items-center gap-2.5 p-2 rounded-2xl bg-white hover:border-neutral-400 border border-neutral-200/80 transition-all duration-200 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] flex-shrink-0 overflow-hidden border border-neutral-200/60 flex items-center justify-center">
                {primaryImg ? (
                  <img
                    src={primaryImg}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs text-neutral-400">✨</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-900 group-hover:text-neutral-600 truncate">
                  {product.name}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">
                  {product.brand}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-serif font-medium text-neutral-900">
                    {formatCurrency(product.finalPrice || product.price)}
                  </span>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isOutOfStock
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-neutral-100 text-neutral-800 border border-neutral-200"
                    }`}
                  >
                    {isOutOfStock ? "Sold Out" : "In Stock"}
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
