import React from "react";
import RatingStars from "./RatingStars.jsx";

export default function ReviewSummary({
  summary = { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  selectedRating = null,
  onSelectRating = () => {}
}) {
  const { averageRating = 0, totalReviews = 0, distribution = {} } = summary;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-neutral-900">
      {/* Left: Overall Score */}
      <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-neutral-100">
        <span className="text-5xl font-bold text-neutral-900 tracking-tight">
          {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
        </span>

        <div className="my-2.5">
          <RatingStars rating={averageRating} size="md" />
        </div>

        <p className="text-xs text-neutral-500 font-light">
          Based on {totalReviews} customer {totalReviews === 1 ? "review" : "reviews"}
        </p>

        {selectedRating && (
          <button
            type="button"
            onClick={() => onSelectRating(null)}
            className="mt-3 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold border border-neutral-200 transition"
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
              className={`w-full flex items-center gap-3 p-1.5 rounded-xl text-left transition ${
                isSelected
                  ? "bg-neutral-100 ring-1 ring-neutral-900"
                  : "hover:bg-neutral-50"
              }`}
            >
              <span className="w-10 text-xs font-semibold text-neutral-700 flex items-center gap-1">
                <span>{stars}</span>
                <span className="text-amber-400 text-[10px]">★</span>
              </span>

              {/* Bar */}
              <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="w-12 text-right text-xs text-neutral-400 font-mono">
                {count} ({percentage}%)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
