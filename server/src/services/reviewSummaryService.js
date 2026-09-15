import mongoose from "mongoose";
import Product from "../models/Product.js";
import ReviewSummary from "../models/ReviewSummary.js";
import reviewRetrievalService from "./reviewRetrievalService.js";
import reviewSummaryPromptService from "./reviewSummaryPromptService.js";
import aiService from "./aiService.js";

/**
 * Review Summary Service
 * Coordinates review retrieval, cache validation via deterministic source hashing,
 * bounded LLM invocation, and structured summary persistence.
 */
class ReviewSummaryService {
  /**
   * Fetches an existing valid summary or generates a new grounded summary from approved reviews.
   *
   * @param {string|mongoose.Types.ObjectId} productId
   * @returns {Promise<Object>}
   */
  async getOrGenerateReviewSummary(productId) {
    const productObjectId = mongoose.Types.ObjectId.isValid(productId)
      ? new mongoose.Types.ObjectId(productId)
      : productId;

    // 1. Verify product existence
    const product = await Product.findOne({ _id: productObjectId, isActive: true }).lean();
    if (!product) {
      const err = new Error("Product not found or is inactive.");
      err.statusCode = 404;
      throw err;
    }

    // 2. Retrieve only approved reviews for this product
    const approvedReviews = await reviewRetrievalService.getApprovedReviews(productObjectId);
    const reviewCount = approvedReviews.length;

    // 3. Threshold check: if no approved reviews exist, return clean empty state without calling LLM
    if (reviewCount === 0) {
      return {
        summary: null,
        sentiment: null,
        themes: [],
        reviewCount: 0,
        generatedAt: null,
        isCached: false,
        message: "There are not enough approved reviews to generate an AI summary."
      };
    }

    // 4. Compute deterministic source hash for current review dataset
    const currentSourceHash = reviewRetrievalService.generateSourceHash(approvedReviews);

    // 5. Check for fresh cached summary
    const cachedSummary = await ReviewSummary.findOne({ product: productObjectId });

    if (
      cachedSummary &&
      !cachedSummary.isStale &&
      cachedSummary.sourceHash === currentSourceHash
    ) {
      return {
        summary: cachedSummary.summary,
        sentiment: cachedSummary.sentiment,
        themes: cachedSummary.themes || [],
        reviewCount,
        generatedAt: cachedSummary.generatedAt,
        isCached: true
      };
    }

    // 6. Dataset has changed or no summary exists: perform bounded representative selection
    const representativeReviews = reviewRetrievalService.selectRepresentativeReviews(
      approvedReviews,
      15
    );

    // 7. Build context & prompts with anti-injection protections
    const context = reviewSummaryPromptService.buildReviewSummaryContext(representativeReviews);
    const { systemPrompt, userPrompt } = reviewSummaryPromptService.buildReviewSummaryPrompt(
      context,
      reviewCount
    );

    // 8. Invoke LLM abstraction
    const aiOutput = await aiService.generateStructuredReviewSummary({
      systemPrompt,
      userPrompt,
      reviews: representativeReviews,
      reviewCount
    });

    // 9. Persist or update cached ReviewSummary in MongoDB
    const persisted = await ReviewSummary.findOneAndUpdate(
      { product: productObjectId },
      {
        product: productObjectId,
        summary: aiOutput.summary,
        sentiment: aiOutput.sentiment,
        themes: aiOutput.themes,
        reviewCountAtGeneration: reviewCount,
        sourceHash: currentSourceHash,
        isStale: false,
        generatedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {
      summary: persisted.summary,
      sentiment: persisted.sentiment,
      themes: persisted.themes || [],
      reviewCount,
      generatedAt: persisted.generatedAt,
      isCached: false
    };
  }

  /**
   * Invalidates any cached review summary for a given product.
   * Called lazily when a review is created, edited, deleted, or moderated.
   *
   * @param {string|mongoose.Types.ObjectId} productId
   */
  async invalidateSummary(productId) {
    if (!productId) return;
    try {
      const productObjectId = mongoose.Types.ObjectId.isValid(productId)
        ? new mongoose.Types.ObjectId(productId)
        : productId;

      await ReviewSummary.updateOne(
        { product: productObjectId },
        {
          isStale: true,
          sourceHash: "stale_invalidated"
        }
      );
    } catch (err) {
      console.warn("[ReviewSummaryService] Invalidate summary error:", err.message);
    }
  }
}

export const reviewSummaryService = new ReviewSummaryService();
export default reviewSummaryService;
