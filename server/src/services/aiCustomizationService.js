import Product from "../models/Product.js";
import aiService from "./aiService.js";
import customizationIntentService from "./customizationIntentService.js";
import customizationValidationService from "./customizationValidationService.js";
import interactionService from "./interactionService.js";

/**
 * Service orchestrating AI-driven 3D product customization.
 * Coordinates product validation, prompt construction, LLM intent parsing,
 * and deterministic business-rule validation.
 */
class AiCustomizationService {
  /**
   * Processes a natural-language 3D customization request.
   *
   * @param {Object} params
   * @param {string} params.productId - Valid product ObjectId
   * @param {string} params.message - Customer natural language styling request
   * @param {Object} params.currentCustomization - Current client customization state
   * @param {string} params.userId - Authenticated user ID
   * @returns {Promise<Object>} Validated, safe customization commands
   */
  async processCustomization({ productId, message, currentCustomization = {}, userId }) {
    // 1. Authoritative product retrieval from MongoDB
    const product = await Product.findById(productId);
    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    if (!product.isActive) {
      const err = new Error("Product is currently inactive and cannot be customized");
      err.statusCode = 400;
      throw err;
    }

    if (!product.customization || !product.customization.enabled) {
      const err = new Error(`3D Customization is not supported for '${product.name}'`);
      err.statusCode = 400;
      throw err;
    }

    if (!Array.isArray(product.customization.areas) || product.customization.areas.length === 0) {
      const err = new Error(`No customizable areas defined for '${product.name}'`);
      err.statusCode = 400;
      throw err;
    }

    // 2. Format safe product capabilities without exposing internal mesh names or database credentials
    const productContext = customizationIntentService.formatProductCustomizationContext(product);

    // 3. Build system instructions and prompt with boundary delimiters
    const systemPrompt = customizationIntentService.buildSystemPrompt();
    const userPrompt = customizationIntentService.buildUserPrompt({
      productContext,
      currentCustomization,
      userMessage: message
    });

    // 4. Invoke LLM intent parser (or local mock engine)
    const rawIntent = await aiService.interpretCustomizationIntent({
      systemPrompt,
      userPrompt,
      userMessage: message,
      product,
      currentCustomization
    });

    // 5. Authoritative validation against product configuration (Hard security boundary)
    const { result } = customizationValidationService.validateIntent(rawIntent, product);

    // 6. Asynchronous telemetry/interaction tracking (fail-safe)
    if (userId) {
      try {
        await interactionService.createInteraction({
          userId,
          productId: product._id,
          type: "CUSTOMIZATION",
          metadata: {
            source: "ai",
            intent: result.intent,
            changesCount: result.changes ? result.changes.length : 0
          }
        });
      } catch (analyticsErr) {
        // Analytics failures must never break the user experience
        console.debug("[AiCustomizationService] Interaction tracking skipped:", analyticsErr.message);
      }
    }

    return result;
  }
}

export const aiCustomizationService = new AiCustomizationService();
export default aiCustomizationService;
