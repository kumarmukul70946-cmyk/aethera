import axios from "axios";

/**
 * Centralized Axios instance for Aethera Commerce.
 * Configured with baseURL from environment and withCredentials: true
 * to support HTTP-only JWT authentication cookies.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract standardized API error messages
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected network error occurred";

    // Format error object for caller
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    customError.errors = error.response?.data?.errors;

    return Promise.reject(customError);
  }
);

export default api;
