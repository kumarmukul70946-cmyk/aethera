import api from "./api.js";

/**
 * Client service for AI Product Comparison.
 * Communicates with POST /api/ai/compare
 */
export const comparisonService = {
  /**
   * Compares 2 to 4 products with grounded catalog facts, deterministic attributes,
   * customer review insights, and optional question answering.
   *
   * @param {Object} params
   * @param {Array<string>} params.productIds - Array of 2 to 4 product ObjectIds
   * @param {string} [params.question] - Optional user question
   * @returns {Promise<Object>} Comparison result
   */
  async compareProducts({ productIds, question = "" }) {
    const payload = {
      productIds,
      ...(question && question.trim() ? { question: question.trim() } : {})
    };

    const response = await api.post("/ai/compare", payload);
    return response.data.data;
  }
};

export default comparisonService;
