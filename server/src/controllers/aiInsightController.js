import aiInsightService from "../services/aiInsightService.js";
import adminAnalyticsService from "../services/adminAnalyticsService.js";
import { validateInsightQueryParams } from "../validators/aiInsightValidators.js";

/**
 * Controller handling Admin AI Business Insights and Authoritative Analytics endpoints.
 */

/**
 * GET /api/admin/ai/insights?period=30d
 * Retrieves cached AI insights or generates new insights if not yet cached.
 */
export const getInsights = async (req, res, next) => {
  try {
    const { period = "30d", startDate, endDate } = req.query;

    const validation = validateInsightQueryParams({ period, startDate, endDate });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const data = await aiInsightService.getBusinessInsights({
      period: validation.sanitized.period,
      startDate: validation.sanitized.startDate,
      endDate: validation.sanitized.endDate,
      forceRegenerate: false
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/ai/insights/generate
 * Forces a fresh LLM generation of business insights, bypassing existing cached insights.
 */
export const generateInsights = async (req, res, next) => {
  try {
    const { period = "30d", startDate, endDate } = req.body;

    const validation = validateInsightQueryParams({ period, startDate, endDate });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const data = await aiInsightService.getBusinessInsights({
      period: validation.sanitized.period,
      startDate: validation.sanitized.startDate,
      endDate: validation.sanitized.endDate,
      forceRegenerate: true
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/analytics?period=30d
 * Retrieves authoritative raw business metrics calculated directly from MongoDB.
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const { period = "30d", startDate, endDate } = req.query;

    const validation = validateInsightQueryParams({ period, startDate, endDate });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const metrics = await adminAnalyticsService.getBusinessMetrics({
      period: validation.sanitized.period,
      startDate: validation.sanitized.startDate,
      endDate: validation.sanitized.endDate
    });

    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getInsights,
  generateInsights,
  getAnalytics
};
