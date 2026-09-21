import aiCustomizationService from "../services/aiCustomizationService.js";

/**
 * Controller handling natural-language 3D product customization.
 */
class AiCustomizationController {
  /**
   * @route   POST /api/ai/customize
   * @desc    Parse user natural-language styling request and return safe, validated 3D changes
   * @access  Private
   */
  async customize(req, res, next) {
    try {
      const { productId, message, currentCustomization } = req.body;
      const userId = req.user?._id;

      const data = await aiCustomizationService.processCustomization({
        productId,
        message,
        currentCustomization,
        userId
      });

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiCustomizationController = new AiCustomizationController();
export default aiCustomizationController;
