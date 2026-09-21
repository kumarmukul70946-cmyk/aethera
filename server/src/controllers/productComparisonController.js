import productComparisonService from "../services/productComparisonService.js";

/**
 * Product Comparison Controller
 * Handles incoming multi-product comparison requests.
 */
class ProductComparisonController {
  /**
   * Compare 2-4 products with authoritative catalog facts and AI explanation.
   *
   * @route   POST /api/ai/compare
   * @access  Private (Authenticated customers)
   */
  async compareProducts(req, res, next) {
    try {
      const { productIds, question } = req.body;
      const userId = req.user?._id;

      const result = await productComparisonService.compareProducts({
        productIds,
        question,
        userId
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return next(error);
    }
  }
}

export const productComparisonController = new ProductComparisonController();
export default productComparisonController;
