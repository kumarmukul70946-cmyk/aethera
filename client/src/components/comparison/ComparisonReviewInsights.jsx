import React from "react";
import { StarIcon } from "../common/Icons.jsx";

/**
 * Customer Review Insights component for multi-product comparison.
 * Synthesizes consensus strengths and potential buyer concerns derived from approved customer feedback.
 */
export default function ComparisonReviewInsights({ products = [], reviewInsights = [] }) {
  if (!reviewInsights || reviewInsights.length === 0) return null;

  const productMap = new Map(products.map((p) => [(p._id || p.id).toString(), p]));

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="font-serif font-bold text-neutral-900 text-lg sm:text-xl">
          Customer Review Intelligence
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Consensus feedback and observations synthesized from verified buyer reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reviewInsights.map((item) => {
          const product = productMap.get(item.productId);
          const title = product?.name || "Product";
          const rating = product?.rating ? Number(product.rating).toFixed(1) : "N/A";
          const count = product?.reviewCount || 0;

          return (
            <div
              key={item.productId}
              className="bg-white border border-neutral-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-neutral-300 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {product?.brand || "Aethera"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-800">
                    <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {rating} ({count})
                  </span>
                </div>

                <h4 className="font-serif font-medium text-neutral-900 text-sm mb-3 line-clamp-1">
                  {title}
                </h4>

                {/* Synthesis summary */}
                <p className="text-xs text-neutral-600 leading-relaxed mb-4 italic">
                  "{item.summary}"
                </p>

                {/* Positive themes */}
                {Array.isArray(item.positiveThemes) && item.positiveThemes.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1.5">
                      Reported Strengths
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.positiveThemes.map((theme, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-medium"
                        >
                          + {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concern themes */}
                {Array.isArray(item.concernThemes) && item.concernThemes.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1.5">
                      Buyer Notes & Considerations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.concernThemes.map((theme, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-medium"
                        >
                          • {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
