import api from "./api.js";

/**
 * Review API Service
 * Handles customer and product review requests via Axios.
 */
export const reviewService = {
  // Fetch paginated reviews for a product with sorting and rating filters
  async getProductReviews(productId, params = {}) {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  // Fetch rating breakdown and average score summary (deterministic)
  async getReviewSummary(productId) {
    const response = await api.get(`/products/${productId}/reviews/summary`);
    return response.data;
  },

  // Fetch AI-generated qualitative review summary (grounded LLM synthesis)
  async getAIReviewSummary(productId) {
    const response = await api.get(`/products/${productId}/review-summary`);
    return response.data;
  },


  // Check whether authenticated user has delivered purchase eligible for review
  async checkEligibility(productId) {
    const response = await api.get(`/products/${productId}/reviews/eligibility`);
    return response.data;
  },

  // Submit verified review
  async createReview(productId, reviewData) {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  // Update customer's own review
  async updateReview(reviewId, reviewData) {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete customer's own review
  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful
  async markHelpful(reviewId) {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  }
};

export default reviewService;
