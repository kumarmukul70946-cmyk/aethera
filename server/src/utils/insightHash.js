import crypto from "crypto";

/**
 * Recursively sort object keys to ensure deterministic canonical JSON stringification.
 *
 * @param {*} value - Any value
 * @returns {*} Canonical structured representation
 */
function canonicalize(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  const sortedKeys = Object.keys(value).sort();
  const result = {};
  for (const key of sortedKeys) {
    // Exclude volatile timestamps or calculation times that change every millisecond
    if (key === "calculatedAt" || key === "timestamp") {
      continue;
    }
    result[key] = canonicalize(value[key]);
  }
  return result;
}

/**
 * Computes a deterministic SHA-256 hash for an analytics metrics snapshot and period.
 *
 * @param {Object} params
 * @param {string} params.period - Analysis period ('today', '7d', '30d', '90d', 'custom')
 * @param {Object} params.dateRange - Start and end date range
 * @param {Object} params.metrics - Business metrics snapshot
 * @returns {string} SHA-256 hex string
 */
export function generateInsightSourceHash({ period, dateRange, metrics }) {
  const canonicalPayload = canonicalize({
    period: period || "30d",
    dateRange: {
      startDate: (dateRange?.startDate || "").slice(0, 16),
      endDate: (dateRange?.endDate || "").slice(0, 16)
    },

    metrics: {
      revenue: metrics?.revenue || {},
      orders: metrics?.orders || {},
      customers: metrics?.customers || {},
      products: {
        topByRevenue: (metrics?.products?.topByRevenue || [])
          .map((p) => ({
            name: p.name,
            revenue: p.revenue,
            unitsSold: p.unitsSold
          }))
          .sort((a, b) => (b.revenue - a.revenue) || a.name.localeCompare(b.name)),
        lowStock: (metrics?.products?.lowStock || [])
          .map((p) => ({
            name: p.name,
            stock: p.stock
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        outOfStock: (metrics?.products?.outOfStock || [])
          .map((p) => ({
            name: p.name
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      },

      interactions: metrics?.interactions || {},
      reviews: metrics?.reviews || {}
    }
  });

  const jsonString = JSON.stringify(canonicalPayload);
  return crypto.createHash("sha256").update(jsonString, "utf8").digest("hex");
}

export default { generateInsightSourceHash };

