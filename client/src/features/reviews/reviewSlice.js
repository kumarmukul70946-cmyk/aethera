import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import reviewService from "../../services/reviewService.js";

export const fetchProductReviews = createAsyncThunk(
  "reviews/fetchProductReviews",
  async ({ productId, params }, { rejectWithValue }) => {
    try {
      const response = await reviewService.getProductReviews(productId, params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch reviews" });
    }
  }
);

export const fetchReviewSummary = createAsyncThunk(
  "reviews/fetchReviewSummary",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await reviewService.getReviewSummary(productId);
      return response.data.summary;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch review summary" });
    }
  }
);

export const checkReviewEligibility = createAsyncThunk(
  "reviews/checkReviewEligibility",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await reviewService.checkEligibility(productId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to check eligibility" });
    }
  }
);

export const submitReview = createAsyncThunk(
  "reviews/submitReview",
  async ({ productId, rating, comment }, { dispatch, rejectWithValue }) => {
    try {
      const response = await reviewService.createReview(productId, { rating, comment });
      // Refresh summary and eligibility
      dispatch(fetchReviewSummary(productId));
      dispatch(checkReviewEligibility(productId));
      return response.data.review;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to submit review" });
    }
  }
);

export const updateExistingReview = createAsyncThunk(
  "reviews/updateExistingReview",
  async ({ reviewId, productId, rating, comment }, { dispatch, rejectWithValue }) => {
    try {
      const response = await reviewService.updateReview(reviewId, { rating, comment });
      if (productId) {
        dispatch(fetchReviewSummary(productId));
        dispatch(checkReviewEligibility(productId));
      }
      return response.data.review;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to update review" });
    }
  }
);

export const deleteExistingReview = createAsyncThunk(
  "reviews/deleteExistingReview",
  async ({ reviewId, productId }, { dispatch, rejectWithValue }) => {
    try {
      await reviewService.deleteReview(reviewId);
      if (productId) {
        dispatch(fetchReviewSummary(productId));
        dispatch(checkReviewEligibility(productId));
      }
      return reviewId;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to delete review" });
    }
  }
);

export const voteHelpful = createAsyncThunk(
  "reviews/voteHelpful",
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await reviewService.markHelpful(reviewId);
      return { reviewId, helpfulCount: response.data.helpfulCount };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to vote helpful" });
    }
  }
);

const initialState = {
  reviews: [],
  summary: {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  },
  eligibility: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  },
  loading: false,
  submitting: false,
  error: null
};

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    resetReviewsState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load reviews";
      })

      // Fetch Summary
      .addCase(fetchReviewSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })

      // Check Eligibility
      .addCase(checkReviewEligibility.fulfilled, (state, action) => {
        state.eligibility = action.payload;
      })
      .addCase(checkReviewEligibility.rejected, (state) => {
        state.eligibility = null;
      })

      // Submit Review
      .addCase(submitReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.reviews.unshift(action.payload);
        if (state.pagination) {
          state.pagination.total += 1;
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || "Failed to submit review";
      })

      // Update Review
      .addCase(updateExistingReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateExistingReview.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.reviews.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(updateExistingReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || "Failed to update review";
      })

      // Delete Review
      .addCase(deleteExistingReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
        if (state.pagination && state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
      })

      // Vote Helpful
      .addCase(voteHelpful.fulfilled, (state, action) => {
        const review = state.reviews.find((r) => r._id === action.payload.reviewId);
        if (review) {
          review.helpfulCount = action.payload.helpfulCount;
        }
      });
  }
});

export const { clearReviewError, resetReviewsState } = reviewSlice.actions;

export const selectReviews = (state) => state.reviews.reviews;
export const selectReviewSummary = (state) => state.reviews.summary;
export const selectReviewEligibility = (state) => state.reviews.eligibility;
export const selectReviewPagination = (state) => state.reviews.pagination;
export const selectReviewLoading = (state) => state.reviews.loading;
export const selectReviewSubmitting = (state) => state.reviews.submitting;
export const selectReviewError = (state) => state.reviews.error;

export default reviewSlice.reducer;
