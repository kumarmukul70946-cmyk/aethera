import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RatingStars from "./RatingStars.jsx";
import {
  submitReview,
  updateExistingReview,
  selectReviewSubmitting
} from "../../features/reviews/reviewSlice.js";

const RATING_LABELS = {
  1: "1 - Poor",
  2: "2 - Below Expectations",
  3: "3 - Average",
  4: "4 - Very Good",
  5: "5 - Exceptional"
};

export default function ReviewForm({ productId, existingReview = null, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const submitting = useSelector(selectReviewSubmitting);

  const [rating, setRating] = useState(existingReview ? existingReview.rating : 5);
  const [comment, setComment] = useState(existingReview ? existingReview.comment : "");
  const [validationError, setValidationError] = useState("");
  const [serverError, setServerError] = useState("");

  const isEditing = Boolean(existingReview);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    setServerError("");

    if (!rating || rating < 1 || rating > 5) {
      setValidationError("Please select a rating between 1 and 5 stars.");
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 5) {
      setValidationError("Review comment must be at least 5 characters long.");
      return;
    }

    if (trimmedComment.length > 1000) {
      setValidationError("Review comment cannot exceed 1000 characters.");
      return;
    }

    try {
      let resultAction;
      if (isEditing) {
        resultAction = await dispatch(
          updateExistingReview({
            reviewId: existingReview._id,
            productId,
            rating,
            comment: trimmedComment
          })
        );
      } else {
        resultAction = await dispatch(
          submitReview({
            productId,
            rating,
            comment: trimmedComment
          })
        );
      }

      if (submitReview.fulfilled.match(resultAction) || updateExistingReview.fulfilled.match(resultAction)) {
        if (onSuccess) onSuccess();
      } else {
        setServerError(resultAction.payload?.message || "Failed to submit review.");
      }
    } catch (err) {
      setServerError("An unexpected error occurred while saving your review.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 animate-in fade-in"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">
            {isEditing ? "Edit Your Review" : "Write a Verified Review"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Share your authentic experience with this product to assist other collectors.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Errors */}
      {validationError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {validationError}
        </div>
      )}
      {serverError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {serverError}
        </div>
      )}

      {/* Star Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Your Rating
        </label>
        <div className="flex items-center gap-4">
          <RatingStars
            rating={rating}
            interactive={true}
            onChange={(r) => setRating(r)}
            size="lg"
          />
          <span className="text-xs font-bold text-amber-400">
            {RATING_LABELS[rating]}
          </span>
        </div>
      </div>

      {/* Comment Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="review-comment"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Review Comment
          </label>
          <span
            className={`text-[11px] font-mono ${
              comment.length > 900
                ? "text-rose-400"
                : comment.length >= 5
                ? "text-slate-400"
                : "text-amber-400"
            }`}
          >
            {comment.length} / 1000
          </span>
        </div>
        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was the product quality, packaging, and performance? What should future buyers know?"
          maxLength={1000}
          required
          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || comment.trim().length < 5}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          {submitting && (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          )}
          <span>{isEditing ? "Update Review" : "Publish Review"}</span>
        </button>
      </div>
    </form>
  );
}
