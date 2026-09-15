import reviewSummaryService from "../services/reviewSummaryService.js";

/**
 * Review Summary Controller
 * Handles HTTP requests for AI-generated review intelligence.
 */
class ReviewSummaryController {
  /**
   * GET /api/products/:productId/review-summary
   * Public endpoint returning qualitative summary, sentiment, and themes.
   */
  async getReviewSummary(req, res, next) {
    try {
      const { productId } = req.params;

      const summaryData = await reviewSummaryService.getOrGenerateReviewSummary(productId);

      return res.status(200).json({
        success: true,
        data: summaryData
      });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: err.message || "Product not found"
        });
      }

      console.error("[ReviewSummaryController] Error generating review summary:", err.message);
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Unable to generate review summary at this time."
      });
    }
  }
}

export const reviewSummaryController = new ReviewSummaryController();
export default reviewSummaryController;
