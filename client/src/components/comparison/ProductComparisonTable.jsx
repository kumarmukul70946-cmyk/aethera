import React from "react";
import ComparisonProductCard from "./ComparisonProductCard.jsx";

/**
 * ProductComparisonTable Component
 * Renders authoritative catalog attributes directly from structured backend data in an elegant Japandi table.
 * Strictly respects MongoDB facts; never renders raw unescaped LLM HTML.
 */
export default function ProductComparisonTable({
  products = [],
  comparisonTable = [],
  onRemoveProduct
}) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs">
      {/* Table Header Section / Product Cards Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Top Product Cards Grid */}
          <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] p-4 sm:p-6 gap-4 border-b border-neutral-200/80 bg-neutral-50/50">
            {/* Corner Column Header */}
            <div className="flex flex-col justify-end pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">
                Comparing
              </span>
              <h3 className="font-serif font-bold text-neutral-900 text-lg sm:text-xl leading-tight">
                {products.length} Products
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Catalog data sourced directly from MongoDB.
              </p>
            </div>

            {/* Product Column Cards */}
            {products.map((p) => (
              <div key={p._id || p.id} className="min-w-[180px]">
                <ComparisonProductCard
                  product={p}
                  onRemove={onRemoveProduct}
                  canRemove={products.length > 2}
                />
              </div>
            ))}
          </div>

          {/* Tabular Specification Rows */}
          <div className="divide-y divide-neutral-100">
            {comparisonTable.map((row, idx) => {
              // Highlight special rows like Price, Rating, Stock
              const isPrice = row.attribute.toLowerCase().includes("price");
              const isRating = row.attribute.toLowerCase().includes("rating");
              const isStock = row.attribute.toLowerCase().includes("stock");

              return (
                <div
                  key={idx}
                  className={`grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] p-3.5 sm:p-4 gap-4 items-center transition duration-150 ${
                    idx % 2 === 0 ? "bg-white" : "bg-neutral-50/40"
                  } hover:bg-neutral-100/60`}
                >
                  {/* Attribute Name Column */}
                  <div className="pr-2">
                    <span className="text-xs font-semibold text-neutral-700 tracking-wide">
                      {row.attribute}
                    </span>
                  </div>

                  {/* Attribute Values Columns */}
                  {row.values.map((v, valIdx) => (
                    <div
                      key={valIdx}
                      className="min-w-[180px] text-xs text-neutral-800 leading-relaxed font-normal"
                    >
                      {isPrice ? (
                        <span className="font-bold text-neutral-900 text-sm">
                          {v.value}
                        </span>
                      ) : isRating ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-neutral-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full text-xs">
                          {v.value}
                        </span>
                      ) : isStock ? (
                        <span
                          className={`font-medium px-2 py-0.5 rounded-full inline-block text-[11px] ${
                            v.value.toLowerCase().includes("in stock")
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {v.value}
                        </span>
                      ) : (
                        <span>{v.value || "—"}</span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
