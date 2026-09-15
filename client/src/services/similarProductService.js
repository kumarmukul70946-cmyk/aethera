import api from "./api.js";

/**
 * Service layer for semantic product similarity retrieval.
 * Calls the backend Part 14 Vector Search & Similarity API.
 */
export const similarProductService = {
  /**
   * Fetches semantically similar products for a given product ID.
   *
   * @param {string} productId - Target product ObjectId
   * @param {number} [limit=4] - Target count (1-20)
   * @returns {Promise<Array>} List of similar products
   */
  async getSimilarProducts(productId, limit = 4) {
    if (!productId) return [];

    const response = await api.get(`/products/${productId}/similar`, {
      params: { limit }
    });

    return response.data?.data?.products || [];
  }
};

export default similarProductService;
