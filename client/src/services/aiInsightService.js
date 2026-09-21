import api from "./api.js";

/**
 * Service providing client access to Admin AI Business Insights and Analytics endpoints.
 */

/**
 * Fetch cached or generated AI Business Insights for a specific period.
 *
 * @param {Object} params
 * @param {string} [params.period="30d"] - 'today', '7d', '30d', '90d', 'custom'
 * @param {string} [params.startDate]
 * @param {string} [params.endDate]
 * @returns {Promise<Object>} AI insights payload
 */
export const getInsights = async ({ period = "30d", startDate, endDate } = {}) => {
  const params = { period };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get("/admin/ai/insights", { params });
  return response.data;
};

/**
 * Force fresh regeneration of AI Business Insights, bypassing existing cache.
 *
 * @param {Object} data
 * @param {string} [data.period="30d"]
 * @param {string} [data.startDate]
 * @param {string} [data.endDate]
 * @returns {Promise<Object>} Regenerated AI insights payload
 */
export const generateInsights = async ({ period = "30d", startDate, endDate } = {}) => {
  const response = await api.post("/admin/ai/insights/generate", {
    period,
    startDate,
    endDate
  });
  return response.data;
};

/**
 * Fetch authoritative raw analytics metrics from MongoDB for the dashboard.
 *
 * @param {Object} params
 * @param {string} [params.period="30d"]
 * @param {string} [params.startDate]
 * @param {string} [params.endDate]
 * @returns {Promise<Object>} Authoritative metrics snapshot
 */
export const getAnalytics = async ({ period = "30d", startDate, endDate } = {}) => {
  const params = { period };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get("/admin/analytics", { params });
  return response.data;
};

export default {
  getInsights,
  generateInsights,
  getAnalytics
};
