import api from "./api.js";

/**
 * Client service for AI-powered 3D product customization.
 * Sends natural language instructions to POST /api/ai/customize
 * and receives safe, validated 3D change commands.
 */
export const aiCustomizationService = {
  /**
   * Interprets natural language styling prompts and returns safe 3D commands.
   *
   * @param {Object} params
   * @param {string} params.productId - MongoDB ObjectId of the product
   * @param {string} params.message - Customer natural-language instruction
   * @param {Object} [params.currentCustomization] - Current active customization state
   * @returns {Promise<{ intent: string, message: string, changes: Array<Object>, question?: string }>}
   */
  async interpretCustomization({ productId, message, currentCustomization = {} }) {
    const payload = {
      productId,
      message: message.trim(),
      currentCustomization
    };

    const response = await api.post("/ai/customize", payload);
    return response.data.data;
  }
};

export default aiCustomizationService;
