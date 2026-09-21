import adminAnalyticsService from "./adminAnalyticsService.js";
import insightContextService from "./insightContextService.js";
import insightPromptService from "./insightPromptService.js";
import { generateInsightSourceHash } from "../utils/insightHash.js";
import { validateAndSanitizeInsightOutput } from "../validators/aiInsightValidators.js";
import aiService from "./aiService.js";
import AIInsight from "../models/AIInsight.js";

/**
 * Service orchestrating AI Business Insights generation, caching, and retrieval.
 *
 * ARCHITECTURAL INVARIANT:
 * AdminAnalyticsService calculates authoritative facts.
 * LLM explains the facts.
 * AI insights are cached by deterministic sourceHash of the underlying metrics.
 */
class AiInsightService {
  /**
   * Retrieves or generates AI business insights for the requested period.
   *
   * @param {Object} options
   * @param {string} [options.period="30d"]
   * @param {string|Date} [options.startDate]
   * @param {string|Date} [options.endDate]
   * @param {boolean} [options.forceRegenerate=false]
   * @returns {Promise<Object>} Formatted AI business insights payload
   */
  async getBusinessInsights({ period = "30d", startDate, endDate, forceRegenerate = false } = {}) {
    // 1. Calculate authoritative business metrics from MongoDB
    const metricsSnapshot = await adminAnalyticsService.getBusinessMetrics({
      period,
      startDate,
      endDate
    });

    // 2. Build compact, PII-free context for the LLM
    const context = insightContextService.buildContext(metricsSnapshot);

    // 3. Generate deterministic sourceHash from canonical metrics
    const sourceHash = generateInsightSourceHash({
      period: metricsSnapshot.period,
      dateRange: metricsSnapshot.dateRange,
      metrics: metricsSnapshot
    });

    // 4. Check for existing cached insight matching the same period and sourceHash
    if (!forceRegenerate) {
      const cachedInsight = await AIInsight.findOne({
        period: metricsSnapshot.period,
        sourceHash
      }).sort({ generatedAt: -1 });

      if (cachedInsight) {
        return {
          period: cachedInsight.period,
          startDate: cachedInsight.startDate,
          endDate: cachedInsight.endDate,
          summary: cachedInsight.summary,
          insights: cachedInsight.insights,
          limitations: cachedInsight.limitations,
          sourceHash: cachedInsight.sourceHash,
          generatedAt: cachedInsight.generatedAt,
          fromCache: true,
          metricsSnapshot: {
            revenue: metricsSnapshot.revenue,
            orders: metricsSnapshot.orders,
            customers: metricsSnapshot.customers,
            conversion: metricsSnapshot.conversion
          }
        };
      }
    }

    // 5. Generate fresh AI interpretation
    const systemPrompt = insightPromptService.getSystemPrompt();
    const userPrompt = insightPromptService.getUserPrompt(context);

    let rawLlmOutput;
    try {
      rawLlmOutput = await aiService.generateBusinessInsights({
        systemPrompt,
        userPrompt,
        context
      });
    } catch (err) {
      console.warn("[AiInsightService] LLM call failed or timed out. Falling back to deterministic analysis:", err.message);
      rawLlmOutput = aiService._generateMockBusinessInsights(context);
    }

    // 6. Validate and sanitize LLM output
    const validationResult = validateAndSanitizeInsightOutput(rawLlmOutput, context);
    let finalInsightData;

    if (validationResult.isValid) {
      finalInsightData = validationResult.sanitizedData;
    } else {
      console.warn("[AiInsightService] AI output failed validation:", validationResult.error);
      finalInsightData = aiService._generateMockBusinessInsights(context);
    }

    // 7. Persist to MongoDB for caching and historical tracking
    const createdInsight = await AIInsight.create({
      type: "PERIODIC_ANALYSIS",
      period: metricsSnapshot.period,
      startDate: new Date(metricsSnapshot.dateRange.startDate),
      endDate: new Date(metricsSnapshot.dateRange.endDate),
      metricsSnapshot,
      summary: finalInsightData.summary,
      insights: finalInsightData.insights,
      limitations: finalInsightData.limitations,
      sourceHash,
      generatedAt: new Date(),
      model: process.env.LLM_MODEL || "gemini-1.5-flash"
    });

    return {
      period: createdInsight.period,
      startDate: createdInsight.startDate,
      endDate: createdInsight.endDate,
      summary: createdInsight.summary,
      insights: createdInsight.insights,
      limitations: createdInsight.limitations,
      sourceHash: createdInsight.sourceHash,
      generatedAt: createdInsight.generatedAt,
      fromCache: false,
      metricsSnapshot: {
        revenue: metricsSnapshot.revenue,
        orders: metricsSnapshot.orders,
        customers: metricsSnapshot.customers,
        conversion: metricsSnapshot.conversion
      }
    };
  }
}

export const aiInsightService = new AiInsightService();
export default aiInsightService;
