import React from "react";
import { SparklesIcon } from "../common/Icons.jsx";

/**
 * AI Narrative Summary component.
 * Displays grounded natural-language comparison and answers to customer inquiries.
 */
export default function ComparisonSummary({
  summary,
  questionAnswer,
  activeQuestion,
  disclaimer
}) {
  if (!summary && !questionAnswer) return null;

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-neutral-800">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/10">
            <SparklesIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-lg text-white">
              AI Comparative Synthesis
            </h3>
            <p className="text-xs text-neutral-400">
              Grounded in current catalog specifications & approved reviews
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/10 text-neutral-300 text-xs font-medium">
          Zero Hallucinations Guarantee
        </span>
      </div>

      {/* Summary Narrative */}
      {summary && (
        <div className="relative z-10 text-neutral-200 text-sm sm:text-base leading-relaxed mb-6 font-light">
          {summary}
        </div>
      )}

      {/* Question Answer Card (if user asked a question) */}
      {questionAnswer && (
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Scenario Analysis
            </span>
            {activeQuestion && (
              <span className="text-xs text-neutral-400 italic truncate">
                — "{activeQuestion}"
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-200 leading-relaxed font-light">
            {questionAnswer}
          </p>
        </div>
      )}

      {/* Bottom disclaimer */}
      <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 relative z-10">
        <span>
          {disclaimer || "Comparison based on current catalog data and approved customer reviews."}
        </span>
        <span className="text-neutral-400">Aethera AI</span>
      </div>
    </div>
  );
}
