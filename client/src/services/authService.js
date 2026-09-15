import api from "./api.js";

/**
 * Authentication Service Layer
 * Interfaces with HTTP-only cookie-based auth endpoints.
 */
export const authService = {
  /**
   * Check current user session using HTTP-only cookie.
   * @returns {Promise<Object>} user object
   */
  async getMe() {
    const response = await api.get("/auth/me");
    return response.data.data.user;
  },

  /**
   * Login with email and password.
   * Server sets HTTP-only cookie on success.
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} user object
   */
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data.data.user;
  },

  /**
   * Register a new user account.
   * Server sets HTTP-only cookie on success.
   * @param {Object} userData - { name, email, password }
   * @returns {Promise<Object>} user object
   */
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data.data.user;
  },

  /**
   * Logout user and clear HTTP-only cookie on server.
   * @returns {Promise<Object>} response data
   */
  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  }
};

export default authService;
