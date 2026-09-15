import interactionService from "../services/interactionService.js";

/**
 * Controller for client-reported interaction events.
 * Accepts only VIEW and SEARCH events.
 * Derives user identity strictly from req.user (established by JWT cookie / optionalProtect).
 */
export const interactionController = {
  /**
   * Handle POST /api/interactions
   */
  async trackInteraction(req, res) {
    try {
      const { type, productId, sessionId, metadata } = req.body;

      // Extract verified user ID from authenticated session, never from client body
      const userId = req.user ? req.user._id : null;

      const interaction = await interactionService.createInteraction({
        userId,
        sessionId,
        productId,
        type,
        metadata: metadata || {}
      });

      return res.status(201).json({
        success: true,
        message: "Interaction recorded successfully",
        data: {
          interactionId: interaction._id,
          type: interaction.type,
          sessionId: interaction.sessionId,
          createdAt: interaction.createdAt
        }
      });
    } catch (error) {
      console.error("[InteractionController] Tracking error:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to record interaction event"
      });
    }
  }
};

export default interactionController;
