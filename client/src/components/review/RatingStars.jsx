import React, { useState } from "react";
import { StarIcon } from "../common/Icons.jsx";

/**
 * Accessible Star Rating Component
 * Supports both read-only display and interactive score selection.
 */
export default function RatingStars({
  rating = 0,
  interactive = false,
  onChange = () => {},
  size = "md",
  showValue = false,
  className = ""
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7"
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className="flex items-center gap-1"
        role={interactive ? "radiogroup" : "img"}
        aria-label={`Rating: ${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(currentRating);

          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={star === rating}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                onClick={() => onChange(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg transition transform hover:scale-125 text-amber-400"
              >
                <StarIcon className={starSize} filled={isFilled} />
              </button>
            );
          }

          return (
            <span key={star} className="text-amber-400">
              <StarIcon className={starSize} filled={isFilled} />
            </span>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-bold text-slate-300 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
