import React from "react";
import { CheckIcon } from "../common/Icons.jsx";

/**
 * Balanced Trade-offs Component.
 * Presents objective strengths and considerations for each product without declaring a fake winner.
 */
export default function ComparisonTradeoffs({ products = [], tradeoffs = [] }) {
  if (!tradeoffs || tradeoffs.length === 0) return null;

  // Build product lookup map
  const productMap = new Map(products.map((p) => [(p._id || p.id).toString(), p]));

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="font-serif font-bold text-neutral-900 text-lg sm:text-xl">
          Balanced Trade-offs & Considerations
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Objective strengths and design decisions to help you decide based on your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tradeoffs.map((item) => {
          const product = productMap.get(item.productId);
          const title = product?.name || "Product";
          const brand = product?.brand || "Aethera";

          return (
            <div
              key={item.productId}
              className="bg-white border border-neutral-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-neutral-300 transition"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {brand}
                </span>
                <h4 className="font-serif font-medium text-neutral-900 text-sm mb-3 line-clamp-1">
                  {title}
                </h4>

                <ul className="space-y-2.5">
                  {item.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 leading-snug">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                        <CheckIcon className="w-2.5 h-2.5" />
                      </div>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
