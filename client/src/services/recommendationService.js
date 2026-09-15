import api from "./api.js";

/**
 * Recommendation Service
 *
 * Provides API client methods for fetching personalized product recommendations
 * powered by the Part 13 behavioral recommendation engine.
 */
export const recommendationService = {
  /**
   * Fetch personalized recommendations for the authenticated customer.
   * Supports optional contextProductId for product-detail page recommendations.
   *
   * @param {Object} [options]
   * @param {number} [options.limit=10] - Number of recommendations to request (1-50)
   * @param {string} [options.contextProductId] - Optional target product ID
   * @returns {Promise<Array>} List of recommendation objects: { product, score, reason }
   */
  async getRecommendations({ limit = 10, contextProductId = null } = {}) {
    const params = { limit };
    if (contextProductId) {
      params.contextProductId = contextProductId;
    }

    const response = await api.get("/recommendations", { params });
    return response.data?.data?.recommendations || [];
  }
};

export default recommendationService;
