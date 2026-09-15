import api from "./api.js";

/**
 * Client service for interacting with the grounded AI Shopping Assistant API.
 */
export const aiService = {
  /**
   * Send a shopping query to the assistant.
   *
   * @param {Object} payload
   * @param {string} payload.message - The customer message
   * @param {string} [payload.sessionId] - Optional active chat session ID
   * @returns {Promise<{ sessionId: string, message: string, sources: Array }>}
   */
  async sendMessage({ message, sessionId = null }) {
    const response = await api.post("/ai/chat", {
      message,
      ...(sessionId ? { sessionId } : {})
    });
    return response.data.data;
  },

  /**
   * Fetch all previous chat sessions for the current authenticated user.
   *
   * @returns {Promise<Array<Object>>}
   */
  async getSessions() {
    const response = await api.get("/ai/sessions");
    return response.data.data.sessions;
  },

  /**
   * Fetch a specific session by ID with complete historical messages.
   *
   * @param {string} sessionId
   * @returns {Promise<Object>}
   */
  async getSessionById(sessionId) {
    const response = await api.get(`/ai/sessions/${sessionId}`);
    return response.data.data.session;
  },

  /**
   * Delete a specific chat session.
   *
   * @param {string} sessionId
   * @returns {Promise<Object>}
   */
  async deleteSession(sessionId) {
    const response = await api.delete(`/ai/sessions/${sessionId}`);
    return response.data;
  }
};

export default aiService;
