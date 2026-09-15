import { recommendationService } from "../services/recommendationService.js";

/**
 * Recommendation Controller
 *
 * Exposes personalized product recommendations based on behavioral analytics.
 * Strictly derives the user identity from req.user._id (via verified JWT cookie).
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const rawLimit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const limit = Math.min(50, Math.max(1, isNaN(rawLimit) ? 10 : rawLimit));

    const contextProductId = req.query.contextProductId || null;

    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userId,
      {
        limit,
        contextProductId
      }
    );

    res.status(200).json({
      success: true,
      message: "Recommendations generated successfully",
      data: {
        recommendations
      }
    });
  } catch (error) {
    next(error);
  }
};
