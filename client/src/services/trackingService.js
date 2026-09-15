import api from "./api.js";

/**
 * Storage key for the client-side anonymous session identifier.
 */
const SESSION_STORAGE_KEY = "aethera_session_id";

/**
 * Anonymous Session Identifier Strategy:
 *
 * Why localStorage instead of Cookies for analytics session IDs?
 * 1. Performance: localStorage values are only accessed when analytics events are explicitly
 *    dispatched. Cookies are automatically attached to every single HTTP request (including
 *    static assets, fonts, 3D GLB models), unnecessarily inflating network bandwidth.
 * 2. Privacy & Control: Storing an anonymous random UUID in localStorage allows the client
 *    to rotate or purge their tracking session without disturbing authenticated HTTP-only
 *    security session cookies.
 * 3. SPA Alignment: Works seamlessly across client-side route transitions in React Router.
 */
export function getOrCreateSessionId() {
  try {
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "sess_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    // If localStorage is blocked by user browser settings, generate temporary in-memory ID
    return "sess_ephemeral_" + Math.random().toString(36).substring(2, 10);
  }
}

/**
 * Frontend Tracking Service
 * Dispatches non-critical behavioral signals (VIEW, SEARCH) to the backend.
 * Designed to be completely non-blocking: analytics errors will never throw
 * or interrupt customer browsing or checkout workflows.
 */
export const trackingService = {
  /**
   * Track a meaningful product view event.
   * @param {string} productId - Product ObjectId
   * @param {Object} [metadata] - Context such as category, brand, source
   */
  async trackView(productId, metadata = {}) {
    if (!productId) return;

    try {
      const sessionId = getOrCreateSessionId();
      await api.post("/interactions", {
        type: "VIEW",
        productId,
        sessionId,
        metadata: {
          source: metadata.source || "product_details",
          category: metadata.category || undefined,
          brand: metadata.brand || undefined,
          ...metadata
        }
      });
    } catch {
      // Analytics must fail quietly; never disrupt user experience
    }
  },

  /**
   * Track an intentional product search action.
   * @param {string} query - Raw search query entered by customer
   * @param {Object} [metadata] - Search context (source, result count, filters)
   */
  async trackSearch(query, metadata = {}) {
    if (!query || typeof query !== "string") return;

    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      const sessionId = getOrCreateSessionId();
      await api.post("/interactions", {
        type: "SEARCH",
        sessionId,
        metadata: {
          query: trimmed.slice(0, 150),
          source: metadata.source || "search_bar",
          ...metadata
        }
      });
    } catch {
      // Silently swallow analytics dispatch errors
    }
  }
};

export default trackingService;
