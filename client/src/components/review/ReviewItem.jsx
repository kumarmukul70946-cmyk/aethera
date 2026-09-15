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
    <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3.5 hover:border-slate-700/80 transition shadow-sm">
      {/* Header: User & Rating */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar Bubble */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
            {userInitial}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">
                {userName}
              </span>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <ShieldCheckIcon className="w-3 h-3" />
                  <span>Verified Purchase</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 mt-1">
              <RatingStars rating={review.rating} size="sm" />
              <span className="text-xs text-slate-500">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Owner Controls */}
        {isOwner && (
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => onEdit(review)}
              className="text-slate-400 hover:text-indigo-400 font-medium transition"
            >
              Edit
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={() => onDelete(review._id)}
              className="text-slate-400 hover:text-rose-400 font-medium transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Review Comment */}
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
        {review.comment}
      </p>

      {/* Footer: Helpful Vote Action */}
      <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleHelpfulClick}
            disabled={voting}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition font-medium text-xs disabled:opacity-50"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span>Helpful ({review.helpfulCount || 0})</span>
          </button>

          {voteError && (
            <span className="text-[11px] text-amber-400 animate-in fade-in">
              {voteError}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
