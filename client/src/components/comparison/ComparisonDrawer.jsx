import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  selectComparisonProducts,
  selectComparisonCount
} from "../../features/comparison/comparisonSelectors.js";
import {
  removeFromCompare,
  clearCompare
} from "../../features/comparison/comparisonSlice.js";
import { CompareIcon, CloseIcon } from "../common/Icons.jsx";
import { formatCurrency } from "../../utils/formatters.js";

/**
 * Floating Comparison Dock at the bottom of the screen.
 * Displays selected items with instant thumbnail preview and quick navigation to /compare.
 */
export default function ComparisonDrawer() {
  const dispatch = useDispatch();
  const location = useLocation();
  const products = useSelector(selectComparisonProducts);
  const count = useSelector(selectComparisonCount);

  // Hide the floating dock on the dedicated comparison page itself
  if (location.pathname === "/compare" || count === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="fixed bottom-4 inset-x-0 z-40 max-w-2xl mx-auto px-4 pointer-events-none"
      >
        <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-2xl shadow-xl p-3 sm:p-3.5 flex items-center justify-between gap-3">
          {/* Left: Selected Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {products.map((p) => {
              const pid = (p._id || p.id).toString();
              return (
                <div
                  key={pid}
                  className="relative group shrink-0 w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center"
                >
                  <img
                    src={p.image || "/placeholder.jpg"}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCompare(pid))}
                    title={`Remove ${p.name}`}
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Empty slots placeholders if fewer than 4 */}
            {Array.from({ length: 4 - count }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="shrink-0 w-12 h-12 rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center text-[10px] text-neutral-400"
              >
                +
              </div>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => dispatch(clearCompare())}
              className="text-xs text-neutral-400 hover:text-neutral-700 font-medium px-2 py-1 transition cursor-pointer"
            >
              Clear
            </button>

            <Link
              to={`/compare?products=${products.map((p) => p._id || p.id).join(",")}`}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ${
                count >= 2
                  ? "bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 pointer-events-none"
              }`}
            >
              <CompareIcon className="w-4 h-4" />
              <span>{count < 2 ? "Select 2 to Compare" : `Compare (${count})`}</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
