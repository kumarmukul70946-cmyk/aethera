import React from "react";
import RatingStars from "./RatingStars.jsx";

export default function ReviewSummary({
  summary = { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  selectedRating = null,
  onSelectRating = () => {}
}) {
  const { averageRating = 0, totalReviews = 0, distribution = {} } = summary;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      {/* Left: Overall Score */}
      <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-800/80">
        <span className="text-5xl font-black text-white tracking-tight">
          {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
        </span>

        <div className="my-2.5">
          <RatingStars rating={averageRating} size="md" />
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Based on {totalReviews} customer {totalReviews === 1 ? "review" : "reviews"}
        </p>

        {selectedRating && (
          <button
            type="button"
            onClick={() => onSelectRating(null)}
            className="mt-3 px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30 transition"
          >
            Filtered by {selectedRating}★ • Show all
          </button>
        )}
      </div>

      {/* Right: Star Breakdown Progress Bars */}
      <div className="md:col-span-7 space-y-2.5">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = distribution[stars] || 0;
          const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
          const isSelected = selectedRating === stars;

          return (
            <button
              key={stars}
              type="button"
              onClick={() => onSelectRating(isSelected ? null : stars)}
              className={`w-full flex items-center gap-3 p-1.5 rounded-xl text-left transition group ${
                isSelected
                  ? "bg-indigo-500/15 ring-1 ring-indigo-500/50"
                  : "hover:bg-slate-800/50"
              }`}
            >
              <span className="w-12 text-xs font-semibold text-slate-300 flex items-center gap-1">
                <span>{stars}</span>
                <span className="text-amber-400 text-[10px]">★</span>
              </span>

              {/* Progress Bar Container */}
              <div className="flex-1 h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSelected
                      ? "bg-indigo-500"
                      : "bg-amber-400/90 group-hover:bg-amber-400"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="w-14 text-right flex items-center justify-end gap-1.5 text-xs text-slate-400">
                <span className="font-mono text-[11px] text-slate-500">{percentage}%</span>
                <span className="font-semibold text-slate-300">({count})</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
