/**
 * CustomizationValidationService — The authoritative security and business-rule validation boundary.
 *
 * Concepts enforced:
 * - Untrusted LLM Defense: LLM output is strictly untrusted. Everything is verified against authoritative MongoDB configuration.
 * - Atomic Validation: If any proposed change targets an invalid area or unsupported option, the entire command is rejected/clarified.
 * - Zero Code Execution: Completely disallows any code injection, script tags, eval, or raw WebGL/mesh identifiers.
 * - Value & Color Normalization: Safely maps natural language color names/hex codes to configured product options.
 */

class CustomizationValidationService {
  /**
   * Sanitizes a string to prevent XSS and strip dangerous tokens.
   */
  sanitizeString(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/<[^>]*>/g, "")
      .replace(/[^\w\s.,!?'"#-]/g, "")
      .trim();
  }

  /**
   * Validates and normalizes raw LLM output against authoritative product customization rules.
   *
   * @param {Object} rawOutput - Parsed JSON from the LLM
   * @param {Object} product - Authoritative product document from MongoDB
   * @returns {{ isValid: boolean, result: Object }}
   */
  validateIntent(rawOutput, product) {
    if (!product || !product.customization || !product.customization.enabled) {
      return {
        isValid: false,
        result: {
          intent: "clarification_needed",
          message: "3D customization is not supported for this product.",
          question: null,
          changes: []
        }
      };
    }

    if (!rawOutput || typeof rawOutput !== "object") {
      return {
        isValid: false,
        result: {
          intent: "clarification_needed",
          message: "Could not interpret customization request.",
          question: "Would you like to change the color or material of any specific part?",
          changes: []
        }
      };
    }

    const rawIntent = typeof rawOutput.intent === "string" ? rawOutput.intent.trim() : "";
    const allowedIntents = ["customize_product", "reset_customization", "clarification_needed"];

    if (!allowedIntents.includes(rawIntent)) {
      return {
        isValid: false,
        result: {
          intent: "clarification_needed",
          message: "Unrecognized customization intent.",
          question: "Which part of the product would you like to customize?",
          changes: []
        }
      };
    }

    // 1. Handle Reset Intent
    if (rawIntent === "reset_customization") {
      return {
        isValid: true,
        result: {
          intent: "reset_customization",
          message: this.sanitizeString(rawOutput.message) || "Resetting 3D customization back to the original design.",
          changes: [],
          question: null
        }
      };
    }

    // 2. Handle Clarification Needed Intent
    if (rawIntent === "clarification_needed") {
      const sanitizedQuestion =
        this.sanitizeString(rawOutput.question) ||
        "Could you please specify which area you would like to change?";
      return {
        isValid: true,
        result: {
          intent: "clarification_needed",
          message: this.sanitizeString(rawOutput.message) || "Please clarify your request.",
          question: sanitizedQuestion,
          changes: []
        }
      };
    }

    // 3. Handle Customize Product Intent
    const rawChanges = Array.isArray(rawOutput.changes) ? rawOutput.changes : [];
    if (rawChanges.length === 0) {
      return {
        isValid: true,
        result: {
          intent: "clarification_needed",
          message: "No specific changes were identified in your request.",
          question: "What colors or materials would you like to apply?",
          changes: []
        }
      };
    }

    // Security check: reject if any change contains script, code, or arbitrary function calls
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /eval\(/i,
      /function\s*\(/i,
      /\(\)\s*=>/i,
      /document\./i,
      /window\./i,
      /process\./i,
      /require\(/i,
      /import\(/i
    ];

    for (const change of rawChanges) {
      const serialized = JSON.stringify(change);
      if (maliciousPatterns.some((pattern) => pattern.test(serialized))) {
        return {
          isValid: false,
          result: {
            intent: "clarification_needed",
            message: "Customization request contains disallowed executable commands.",
            question: "Please use simple color or material descriptions.",
            changes: []
          }
        };
      }
    }

    const allowedAreas = product.customization.areas || [];
    const validatedChanges = [];

    // Atomic validation: verify each change against authoritative product options
    for (const change of rawChanges) {
      if (!change || typeof change !== "object") {
        return {
          isValid: false,
          result: {
            intent: "clarification_needed",
            message: "Customization change entry was malformed.",
            question: "Please try specifying the area and color again.",
            changes: []
          }
        };
      }

      const targetAreaId = (change.area || "").trim().toLowerCase();
      const targetProperty = (change.property || "color").trim().toLowerCase();
      const targetValue = (change.value || "").trim();

      // Check if area exists in product configuration
      const areaDef = allowedAreas.find(
        (a) =>
          a.id.toLowerCase() === targetAreaId ||
          (a.name && a.name.toLowerCase().includes(targetAreaId))
      );

      if (!areaDef) {
        const supportedAreaNames = allowedAreas.map((a) => a.name || a.id).join(", ");
        return {
          isValid: false,
          result: {
            intent: "clarification_needed",
            message: `'${change.area}' is not a customizable area on this product.`,
            question: `Supported customizable areas are: ${supportedAreaNames}. Which would you like to style?`,
            changes: []
          }
        };
      }

      // Check if property matches area type
      const areaType = (areaDef.type || "color").toLowerCase();
      if (targetProperty !== areaType && !(targetProperty === "color" && areaType === "color")) {
        return {
          isValid: false,
          result: {
            intent: "clarification_needed",
            message: `Property '${targetProperty}' is not supported for '${areaDef.name || areaDef.id}'.`,
            question: `This area only supports ${areaType} changes.`,
            changes: []
          }
        };
      }

      // Find matching allowed option (normalized by ID, hex color, or label)
      const matchedOption = this._matchAllowedOption(targetValue, areaDef.options || []);

      if (!matchedOption) {
        const allowedOptionLabels = (areaDef.options || [])
          .map((opt) => opt.name || opt.label || opt.id)
          .join(", ");
        return {
          isValid: false,
          result: {
            intent: "clarification_needed",
            message: `'${targetValue}' is not an available ${areaType} for ${areaDef.name || areaDef.id}.`,
            question: `Available options for ${areaDef.name || areaDef.id} are: ${allowedOptionLabels}. Which would you prefer?`,
            changes: []
          }
        };
      }

      // Append safe, canonical change command
      validatedChanges.push({
        area: areaDef.id,
        areaName: areaDef.name || areaDef.id,
        property: areaType,
        value: matchedOption.color || matchedOption.value,
        optionId: matchedOption.id,
        optionName: matchedOption.name || matchedOption.label || matchedOption.id,
        roughness: typeof matchedOption.roughness === "number" ? matchedOption.roughness : 0.4,
        metalness: typeof matchedOption.metalness === "number" ? matchedOption.metalness : 0.2
      });
    }

    const defaultConfirmMsg = `Applied updates to: ${validatedChanges
      .map((c) => `${c.areaName} (${c.optionName})`)
      .join(", ")}.`;

    return {
      isValid: true,
      result: {
        intent: "customize_product",
        message: this.sanitizeString(rawOutput.message) || defaultConfirmMsg,
        changes: validatedChanges,
        question: null
      }
    };
  }

  /**
   * Matches a raw value or color name against a list of configured area options.
   * Performs semantic normalization (e.g. "black" matches "Midnight Black" or "#0f172a").
   *
   * @param {string} value - Raw value or natural color name
   * @param {Array<Object>} options - Configured area options
   * @returns {Object|null} Matching option or null
   */
  _matchAllowedOption(value, options = []) {
    if (!value || !Array.isArray(options) || options.length === 0) return null;

    const clean = value.toLowerCase().trim();

    // 1. Direct ID match
    const byId = options.find((opt) => opt.id && opt.id.toLowerCase() === clean);
    if (byId) return byId;

    // 2. Direct Hex / Value match
    const byValue = options.find(
      (opt) =>
        (opt.value && opt.value.toLowerCase() === clean) ||
        (opt.color && opt.color.toLowerCase() === clean)
    );
    if (byValue) return byValue;

    // 3. Direct Name match
    const byName = options.find((opt) => {
      const name = (opt.name || opt.label || "").toLowerCase();
      return name === clean;
    });
    if (byName) return byName;

    // 4. Substring / Token match (e.g. "black" in "midnight black", "cyan" in "cyber cyan", "gold" in "champagne gold")
    const byToken = options.find((opt) => {
      const name = (opt.name || opt.label || opt.id || "").toLowerCase();
      const tokens = clean.split(/\s+/);
      return tokens.some((token) => token.length > 2 && name.includes(token));
    });
    if (byToken) return byToken;

    // 5. Common color keyword fallbacks mapping to known hex/names
    const colorKeywordMap = {
      black: ["black", "midnight", "obsidian", "dark", "#000000", "#0f172a", "#020617"],
      white: ["white", "lunar", "cream", "snow", "#ffffff", "#f8fafc", "#fef3c7"],
      cyan: ["cyan", "blue", "neon", "electric", "#06b6d4", "#6366f1"],
      red: ["red", "crimson", "ruby", "#b91c1c", "#ff0000"],
      gold: ["gold", "champagne", "solar", "yellow", "#d97706", "#f59e0b"],
      pink: ["pink", "plasma", "magenta", "#ec4899", "#ff00ff"],
      charcoal: ["charcoal", "slate", "grey", "gray", "#334155"]
    };

    for (const [keyword, synonyms] of Object.entries(colorKeywordMap)) {
      if (clean.includes(keyword) || synonyms.some((s) => clean.includes(s))) {
        const found = options.find((opt) => {
          const optName = (opt.name || opt.id || "").toLowerCase();
          const optColor = (opt.color || opt.value || "").toLowerCase();
          return synonyms.some((s) => optName.includes(s) || optColor === s);
        });
        if (found) return found;
      }
    }

    return null;
  }
}

export const customizationValidationService = new CustomizationValidationService();
export default customizationValidationService;
