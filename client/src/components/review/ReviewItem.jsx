import React, { useState } from "react";
import RatingStars from "./RatingStars.jsx";
import { ShieldCheckIcon } from "../common/Icons.jsx";

export default function ReviewItem({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onVoteHelpful
}) {
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState("");

  const isOwner =
    currentUserId &&
    (review.user?._id === currentUserId || review.user === currentUserId);

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "Recently";

  const handleHelpfulClick = async () => {
    if (voting) return;
    setVoteError("");
    try {
      setVoting(true);
      await onVoteHelpful(review._id);
    } catch (err) {
      setVoteError(err.message || "Already voted");
      setTimeout(() => setVoteError(""), 3000);
    } finally {
      setVoting(false);
    }
  };

  const userName = review.user?.name || "Verified Collector";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 space-y-3.5 shadow-xs hover:shadow-sm transition text-neutral-900">
      {/* Header: User & Rating */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar Bubble */}
          <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-800 font-bold text-sm flex items-center justify-center border border-neutral-200 shadow-xs">
            {userInitial}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900">
                {userName}
              </span>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                  <ShieldCheckIcon className="w-3 h-3 text-emerald-600" />
                  <span>Verified Buyer</span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-400 font-light">{formattedDate}</span>
          </div>
        </div>

        {/* Rating Stars */}
        <RatingStars rating={review.rating} size="sm" />
      </div>

      {/* Review Title & Body */}
      {review.title && (
        <h5 className="font-bold text-sm text-neutral-900">{review.title}</h5>
      )}
      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
        {review.comment}
      </p>

      {/* Actions & Helpful Count */}
      <div className="pt-2 flex items-center justify-between gap-4 text-xs border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleHelpfulClick}
            disabled={voting}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-[11px] transition"
          >
            <span>👍 Helpful</span>
            <span>({review.helpfulCount || 0})</span>
          </button>
          {voteError && (
            <span className="text-rose-600 text-[11px]">{voteError}</span>
          )}
        </div>

        {/* Owner Controls */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(review)}
              className="text-neutral-500 hover:text-neutral-900 font-medium text-xs"
            >
              Edit
            </button>
            <span className="text-neutral-300">•</span>
            <button
              type="button"
              onClick={() => onDelete(review._id)}
              className="text-rose-600 hover:text-rose-800 font-medium text-xs"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
