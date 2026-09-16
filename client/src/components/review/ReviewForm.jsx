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

      if (
        (isEditing && updateExistingReview.fulfilled.match(resultAction)) ||
        (!isEditing && submitReview.fulfilled.match(resultAction))
      ) {
        if (!isEditing) setComment("");
        if (onSuccess) onSuccess();
      } else {
        setServerError(resultAction.payload?.message || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      setServerError("An unexpected error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-5 text-neutral-900">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <h4 className="font-bold text-base text-neutral-900">
          {isEditing ? "Edit Your Review" : "Write a Customer Review"}
        </h4>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-neutral-400 hover:text-neutral-900 font-semibold"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Errors */}
      {validationError && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
          {validationError}
        </div>
      )}
      {serverError && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
          {serverError}
        </div>
      )}

      {/* Star Selector */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
          Your Rating
        </label>
        <div className="flex items-center gap-4">
          <RatingStars
            rating={rating}
            interactive={true}
            onChange={(r) => setRating(r)}
            size="lg"
          />
          <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-3 py-1 rounded-full">
            {RATING_LABELS[rating]}
          </span>
        </div>
      </div>

      {/* Comment Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="review-comment"
            className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
          >
            Review Comment
          </label>
          <span
            className={`text-[11px] font-mono ${
              comment.length > 900
                ? "text-rose-600"
                : comment.length >= 5
                ? "text-neutral-400"
                : "text-amber-600"
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
          className="w-full px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || comment.trim().length < 5}
          className="px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-xs font-semibold transition shadow-sm flex items-center gap-2"
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
