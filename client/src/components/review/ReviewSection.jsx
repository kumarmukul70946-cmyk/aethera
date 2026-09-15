import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth.js";
import ReviewSummary from "./ReviewSummary.jsx";
import ReviewItem from "./ReviewItem.jsx";
import ReviewForm from "./ReviewForm.jsx";
import {
  fetchProductReviews,
  fetchReviewSummary,
  checkReviewEligibility,
  deleteExistingReview,
  voteHelpful,
  selectReviews,
  selectReviewSummary,
  selectReviewEligibility,
  selectReviewPagination,
  selectReviewLoading,
  selectReviewError
} from "../../features/reviews/reviewSlice.js";
import { ShieldCheckIcon } from "../common/Icons.jsx";

export default function ReviewSection({ productId }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

  const reviews = useSelector(selectReviews);
  const summary = useSelector(selectReviewSummary);
  const eligibility = useSelector(selectReviewEligibility);
  const pagination = useSelector(selectReviewPagination);
  const loading = useSelector(selectReviewLoading);
  const error = useSelector(selectReviewError);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Fetch reviews whenever productId, page, sort, or ratingFilter changes
  useEffect(() => {
    if (productId) {
      dispatch(
        fetchProductReviews({
          productId,
          params: {
            page,
            limit: 6,
            sort,
            rating: ratingFilter || undefined
          }
        })
      );
    }
  }, [dispatch, productId, page, sort, ratingFilter]);

  // Fetch summary on product change
  useEffect(() => {
    if (productId) {
      dispatch(fetchReviewSummary(productId));
    }
  }, [dispatch, productId]);

  // Check review eligibility if user is authenticated
  useEffect(() => {
    if (productId && isAuthenticated) {
      dispatch(checkReviewEligibility(productId));
    }
  }, [dispatch, productId, isAuthenticated]);

  const handleRatingFilterChange = (r) => {
    setRatingFilter(r);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      await dispatch(deleteExistingReview({ reviewId, productId }));
      dispatch(
        fetchProductReviews({
          productId,
          params: { page, limit: 6, sort, rating: ratingFilter || undefined }
        })
      );
    }
  };

  const handleVoteHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      throw new Error("Please log in to vote");
    }
    const result = await dispatch(voteHelpful(reviewId));
    if (voteHelpful.rejected.match(result)) {
      throw new Error(result.payload?.message || "Failed to vote");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    setPage(1);
    dispatch(
      fetchProductReviews({
        productId,
        params: { page: 1, limit: 6, sort, rating: ratingFilter || undefined }
      })
    );
  };

  return (
    <section className="pt-12 border-t border-slate-800 space-y-8" id="reviews-section">
      {/* Section Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real feedback from verified purchasers who own and use this product.
          </p>
        </div>

        {/* Action Button: Only visible to eligible buyers */}
        {isAuthenticated && eligibility?.canReview && !showForm && (
          <button
            type="button"
            onClick={() => {
              setEditingReview(null);
              setShowForm(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 self-start sm:self-auto"
          >
            <ShieldCheckIcon className="w-4 h-4 text-indigo-200" />
            <span>Write a Verified Review</span>
          </button>
        )}

        {isAuthenticated && eligibility?.alreadyReviewed && !showForm && (
          <button
            type="button"
            onClick={() => handleEditReview(eligibility.existingReview)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition self-start sm:self-auto"
          >
            Edit Your Review
          </button>
        )}
      </div>

      {/* Review Summary Breakdown */}
      <ReviewSummary
        summary={summary}
        selectedRating={ratingFilter}
        onSelectRating={handleRatingFilterChange}
      />

      {/* Write/Edit Review Form (Collapsible) */}
      {showForm && (
        <ReviewForm
          productId={productId}
          existingReview={editingReview}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">
            {pagination.total || reviews.length} {pagination.total === 1 ? "Review" : "Reviews"}
          </span>

          {ratingFilter && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold">
              <span>{ratingFilter} Stars</span>
              <button
                type="button"
                onClick={() => handleRatingFilterChange(null)}
                className="hover:text-white"
                aria-label="Remove filter"
              >
                ✕
              </button>
            </span>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="review-sort" className="text-slate-400 font-medium">
            Sort by:
          </label>
          <select
            id="review-sort"
            value={sort}
            onChange={handleSortChange}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition text-xs font-medium"
          >
            <option value="newest">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/60 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-28 h-3 bg-slate-800 rounded" />
                  <div className="w-20 h-2.5 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="w-full h-10 bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
          <p className="text-xs text-rose-400">{error}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-300">No reviews found</p>
          <p className="text-xs text-slate-500">
            {ratingFilter
              ? `There are currently no ${ratingFilter}-star reviews for this product.`
              : "Be the first verified customer to share your thoughts on this product!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              currentUserId={user?.id || user?._id}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onVoteHelpful={handleVoteHelpful}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPreviousPage}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white transition font-semibold"
          >
            ← Previous
          </button>

          <span className="text-slate-400 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white transition font-semibold"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
