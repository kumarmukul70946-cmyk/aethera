import api from "./api.js";

/**
 * Product & Category Service Layer
 * Abstracts backend HTTP communication for product and category operations.
 */
export const productService = {
  /**
   * Fetch paginated products with filtering and sorting options.
   * @param {Object} params - Query params { page, limit, search, category, brand, minPrice, maxPrice, rating, sort }
   * @returns {Promise<Object>} { products, pagination, brands, priceRange, categories }
   */
  async getProducts(params = {}) {
    const response = await api.get("/products", { params });
    return response.data.data;
  },

  /**
   * Fetch a single product by MongoDB ObjectId.
   * @param {string} id - Product ObjectId
   * @returns {Promise<Object>} product
   */
  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data.data.product;
  },

  /**
   * Fetch a single product by unique URL slug.
   * @param {string} slug - Product slug (e.g. "aether-lumina-smartwatch")
   * @returns {Promise<Object>} product
   */
  async getProductBySlug(slug) {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data.data.product;
  },

  /**
   * Search products by keyword query.
   * @param {Object} params - Query params { q, page, limit, category, brand, sort }
   * @returns {Promise<Object>} { products, pagination }
   */
  async searchProducts(params = {}) {
    const response = await api.get("/products/search", { params });
    return response.data.data;
  },

  /**
   * Fetch featured products for showcases and banners.
   * @param {Object} params - Query params { page, limit }
   * @returns {Promise<Object>} { products, pagination }
   */
  async getFeaturedProducts(params = {}) {
    const response = await api.get("/products/featured", { params });
    return response.data.data;
  },

  /**
   * Fetch trending products sorted by sales and rating.
   * @param {Object} params - Query params { page, limit }
   * @returns {Promise<Object>} { products, pagination }
   */
  async getTrendingProducts(params = {}) {
    const response = await api.get("/products/trending", { params });
    return response.data.data;
  },

  /**
   * Fetch all active categories with product counts.
   * @returns {Promise<Array>} Array of category objects
   */
  async getCategories() {
    const response = await api.get("/categories");
    return response.data.data.categories;
  },

  /**
   * Fetch a single category by ID or slug.
   * @param {string} id - Category ObjectId or slug
   * @returns {Promise<Object>} Category object
   */
  async getCategoryById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data.data.category;
  }
};

export default productService;
