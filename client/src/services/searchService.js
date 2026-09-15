import api from "./api.js";

/**
 * Unified Search Service Layer for Aethera Commerce.
 * Supports AI Semantic Search (meaning-based) and traditional Keyword Search.
 */
export const searchService = {
  /**
   * Execute AI-powered semantic search.
   * Converts query to vector embeddings and queries MongoDB Atlas Vector Search.
   *
   * @param {Object} params - { q, page, limit, category, brand, minPrice, maxPrice, rating }
   * @returns {Promise<Object>} { products, query, pagination, searchMode }
   */
  async semanticSearch(params = {}) {
    const response = await api.get("/search/semantic", { params });
    return response.data.data;
  },

  /**
   * Execute lexical keyword search across product catalog.
   *
   * @param {Object} params - { q, page, limit, category, brand, minPrice, maxPrice, rating, sort }
   * @returns {Promise<Object>} { products, pagination }
   */
  async keywordSearch(params = {}) {
    const response = await api.get("/products/search", { params });
    return response.data.data;
  }
};

export default searchService;
